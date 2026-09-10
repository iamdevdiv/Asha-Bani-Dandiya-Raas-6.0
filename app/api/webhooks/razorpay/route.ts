import { NextRequest, NextResponse } from 'next/server';
import {
  getTicketBookingByOrderId,
  getTicketBookingById,
  completeTicketBookingPayment,
  recordCouponUsage,
  getBookingByOrderId,
  getBookingByNumber,
  updateBookingPayment,
  markStallBooked,
  getSettings,
  claimStallBookingForConfirmation,
} from '@/lib/db';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { generateStallQrCode } from '@/lib/qr-service';
import { generateBookingConfirmationPackage } from '@/lib/docx-pdf-service';
import { sendTicketBookingSms, sendStallBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header');
      return NextResponse.json({ success: false, message: 'Missing signature header' }, { status: 400 });
    }

    // Verify cryptographic signature from Razorpay
    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid webhook signature');
      return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 400 });
    }

    let event: any = null;
    try {
      event = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error('[Razorpay Webhook] JSON parse error:', parseErr);
      return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventName = event.event;
    console.log(`[Razorpay Webhook] Received authenticated event: ${eventName}`);

    // Process payment success events
    if (eventName === 'order.paid' || eventName === 'payment.captured') {
      const payload = event.payload || {};
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;

      const orderId: string = paymentEntity?.order_id || orderEntity?.id || '';
      const paymentId: string = paymentEntity?.id || `WEBHOOK_PAY_${Date.now()}`;
      const receipt: string = orderEntity?.receipt || paymentEntity?.description || '';

      if (!orderId && !receipt) {
        console.warn('[Razorpay Webhook] Event payload has neither order_id nor receipt reference');
        return NextResponse.json({ success: true, message: 'Ignored: No order reference' });
      }

      console.log(`[Razorpay Webhook] Processing event for orderId="${orderId}", receipt="${receipt}", paymentId="${paymentId}"`);

      // -----------------------------------------------------------------------
      // 1. Check Customer Ticket Bookings
      // -----------------------------------------------------------------------
      let ticketBooking: any = null;
      if (orderId) {
        ticketBooking = await getTicketBookingByOrderId(orderId);
      }
      if (!ticketBooking && receipt) {
        ticketBooking = await getTicketBookingById(receipt);
      }

      if (ticketBooking) {
        console.log(`[Razorpay Webhook] Found TicketBooking: ${ticketBooking.bookingNumber} (Current Status: ${ticketBooking.paymentStatus})`);

        if (ticketBooking.paymentStatus === 'success') {
          console.log(`[Razorpay Webhook] TicketBooking #${ticketBooking.bookingNumber} already confirmed. Idempotent skip.`);
          return NextResponse.json({ success: true, message: 'Ticket already confirmed', bookingNumber: ticketBooking.bookingNumber });
        }

        // Confirm ticket booking, generate QR pass and credit voucher
        const completedBooking = await completeTicketBookingPayment({
          bookingId: ticketBooking.id,
          razorpayOrderId: orderId || ticketBooking.razorpayOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature || 'WEBHOOK_VERIFIED',
        });

        // Only dispatch SMS and record coupons if this request was the one that actually completed the payment
        if (completedBooking && completedBooking.isNewlyConfirmed) {
          if (ticketBooking.couponCode) {
            await recordCouponUsage(ticketBooking.couponCode).catch((couponErr) => {
              console.warn('[Razorpay Webhook] Coupon recording error:', couponErr);
            });
          }

          // Dispatch confirmation SMS to customer asynchronously
          sendTicketBookingSms(completedBooking).catch((smsErr) => {
            console.error('[Razorpay Webhook SMS Error] Ticket booking:', smsErr);
          });
        }

        console.log(`[Razorpay Webhook] ✅ Successfully confirmed TicketBooking #${completedBooking.bookingNumber} via Webhook!`);
        return NextResponse.json({
          success: true,
          type: 'ticket',
          status: 'confirmed',
          bookingNumber: completedBooking.bookingNumber,
        });
      }

      // -----------------------------------------------------------------------
      // 2. Check Stall Bookings
      // -----------------------------------------------------------------------
      let stallBooking: any = null;
      if (orderId) {
        stallBooking = await getBookingByOrderId(orderId);
      }
      if (!stallBooking && receipt) {
        stallBooking = await getBookingByNumber(receipt);
      }

      if (stallBooking) {
        console.log(`[Razorpay Webhook] Found StallBooking: ${stallBooking.bookingNumber} for Stall ${stallBooking.stallNumber} (Status: ${stallBooking.paymentStatus})`);

        if (stallBooking.paymentStatus === 'success') {
          console.log(`[Razorpay Webhook] StallBooking #${stallBooking.bookingNumber} already confirmed. Idempotent skip.`);
          return NextResponse.json({ success: true, message: 'Stall already confirmed', bookingNumber: stallBooking.bookingNumber });
        }

        // Atomically claim the booking to prevent race condition with concurrent verify-payment
        const { claimed, booking: claimedBooking } = await claimStallBookingForConfirmation(stallBooking.id, {
          razorpayPaymentId: paymentId,
          razorpaySignature: signature || 'WEBHOOK_VERIFIED',
        });

        if (!claimed) {
          console.log(`[Razorpay Webhook] StallBooking #${stallBooking.bookingNumber} already claimed or processed. Idempotent skip.`);
          return NextResponse.json({ success: true, message: 'Stall already claimed or confirmed', bookingNumber: stallBooking.bookingNumber });
        }

        const settings = await getSettings();
        const eventDate = settings.event_date || '13 October 2026';
        const venue = `${settings.venue_name || 'Maharaja Agrasen Bhavan'}, ${settings.venue_address || 'Saharanpur'}`;

        // 1. Generate QR Code
        const qrCodeDataUrl = await generateStallQrCode({
          bookingNumber: stallBooking.bookingNumber,
          stallNumber: stallBooking.stallNumber,
          bookerName: stallBooking.bookerName,
          brandName: stallBooking.brandName,
          stallType: stallBooking.stallType,
          eventDate,
          venue,
        });

        // 2. Generate 1080x1080 Pass Image & DOCX package
        const docxPackage = await generateBookingConfirmationPackage({
          stallNumber: stallBooking.stallNumber,
          bookerName: stallBooking.bookerName,
          brandName: stallBooking.brandName,
          bookingNumber: stallBooking.bookingNumber,
          eventDate,
          venue,
          qrDataUrl: qrCodeDataUrl,
        });

        // 3. Mark stall as booked in database
        await markStallBooked(stallBooking.stallNumber, {
          bookingId: stallBooking.id,
          bookerName: stallBooking.bookerName,
          brandName: stallBooking.brandName,
          mobile: stallBooking.mobile,
          email: stallBooking.email,
        });

        // 4. Update booking payment record
        const updatedBooking = await updateBookingPayment(stallBooking.id, {
          razorpayPaymentId: paymentId,
          razorpaySignature: signature || 'WEBHOOK_VERIFIED',
          paymentStatus: 'success',
          qrCodeDataUrl,
          confirmationDocUrl: docxPackage.image1080DataUrl,
        });

        // 5. Dispatch confirmation SMS to stall owner asynchronously
        if (updatedBooking) {
          sendStallBookingSms(updatedBooking).catch((smsErr) => {
            console.error('[Razorpay Webhook SMS Error] Stall booking:', smsErr);
          });
        }

        console.log(`[Razorpay Webhook] ✅ Successfully confirmed StallBooking #${stallBooking.bookingNumber} via Webhook!`);
        return NextResponse.json({
          success: true,
          type: 'stall',
          status: 'confirmed',
          bookingNumber: stallBooking.bookingNumber,
        });
      }

      console.warn(`[Razorpay Webhook] No matching ticket or stall booking found for orderId="${orderId}", receipt="${receipt}"`);
      return NextResponse.json({ success: true, message: 'No matching booking found' });
    }

    // Acknowledge other events (e.g. payment.failed, refund.processed)
    return NextResponse.json({ success: true, message: `Event ${eventName} acknowledged` });
  } catch (error: any) {
    console.error('[Razorpay Webhook] Unexpected error handling webhook:', error);
    // Return 500 so Razorpay retries if an unexpected server exception occurs
    return NextResponse.json(
      { success: false, message: error.message || 'Webhook internal error' },
      { status: 500 }
    );
  }
}
