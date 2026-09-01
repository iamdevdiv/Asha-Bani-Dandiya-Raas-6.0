import { NextRequest, NextResponse } from 'next/server';
import { completeTicketBookingPayment, getTicketBookingById, recordCouponUsage } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendTicketBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await getTicketBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Verify signature
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const isValid = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid payment signature. Verification failed.' },
          { status: 400 }
        );
      }
    }

    const completedBooking = await completeTicketBookingPayment({
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (booking.couponCode) {
      await recordCouponUsage(booking.couponCode);
    }

    // Fire SMS asynchronously without blocking the user response
    sendTicketBookingSms(completedBooking).catch((smsErr) => {
      console.error('[SMS Dispatch Error] Ticket booking:', smsErr);
    });

    return NextResponse.json({
      success: true,
      booking: completedBooking,
      passUrl: `/dandiyaraas/tickets/pass/${completedBooking.id}`,
      message: 'Ticket confirmed and pass generated successfully!',
    });
  } catch (error: any) {
    console.error('Error verifying ticket payment:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
