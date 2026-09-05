import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { completeTicketBookingPayment, getTicketBookingById, recordCouponUsage } from '@/lib/db';
import { sendTicketBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketBookingId, razorpayPaymentId, sendSms } = body;

    if (!ticketBookingId) {
      return NextResponse.json({ success: false, message: 'Ticket Booking ID is required.' }, { status: 400 });
    }

    const booking = await getTicketBookingById(ticketBookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Ticket booking not found.' }, { status: 404 });
    }

    // Determine payment details
    const paymentId = razorpayPaymentId && razorpayPaymentId.trim()
      ? razorpayPaymentId.trim()
      : booking.razorpayPaymentId || `ADMIN_CONFIRMED_${Date.now()}`;

    const orderId = booking.razorpayOrderId || `ORD_ADMIN_${booking.bookingNumber}`;
    const signature = booking.razorpaySignature || 'ADMIN_MANUALLY_VERIFIED';

    // Complete ticket booking payment: generates QR code, updates payment status, credits voucher, credits ambassador
    const completedBooking = await completeTicketBookingPayment({
      bookingId: booking.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    // Record coupon usage if a coupon was attached
    if (booking.couponCode) {
      try {
        await recordCouponUsage(booking.couponCode);
      } catch (couponErr) {
        console.warn('[Admin Confirm] Coupon usage tracking notice:', couponErr);
      }
    }

    // Dispatch SMS if requested (default is true)
    let smsDispatched = false;
    let smsError: string | null = null;

    if (sendSms !== false) {
      try {
        const smsRes = await sendTicketBookingSms(completedBooking);
        if (smsRes && smsRes.success) {
          smsDispatched = true;
        } else if (smsRes && smsRes.error) {
          smsError = smsRes.error;
        }
      } catch (err: any) {
        console.error('[Admin Confirm] Error dispatching SMS:', err);
        smsError = err?.message || 'Failed to dispatch SMS';
      }
    }

    return NextResponse.json({
      success: true,
      booking: completedBooking,
      passUrl: `/dandiyaraas/tickets/pass/${completedBooking.id}`,
      smsDispatched,
      smsError,
      message: `Ticket booking #${completedBooking.bookingNumber} confirmed successfully. Official pass generated!${smsDispatched ? ' SMS sent to customer.' : ''}`,
    });
  } catch (error: any) {
    console.error('[Admin Confirm] Error in confirming ticket booking payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to confirm ticket booking payment.' },
      { status: 500 }
    );
  }
}
