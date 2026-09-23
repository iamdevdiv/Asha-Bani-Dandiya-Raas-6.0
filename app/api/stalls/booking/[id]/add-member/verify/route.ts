import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, completeStallMemberPayment, getStallMembersByBookingId } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendStallMemberAddedSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      memberOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!razorpayPaymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing Razorpay payment ID.' },
        { status: 400 }
      );
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Stall booking not found.' },
        { status: 404 }
      );
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId || '',
      paymentId: razorpayPaymentId,
      signature: razorpaySignature || '',
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Payment signature verification failed.' },
        { status: 400 }
      );
    }

    // Complete member payment and update booking's teamMembers
    const result = await completeStallMemberPayment({
      memberOrderId,
      orderId: razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    // Send SMS dispatch on successful addition if newly confirmed
    if (result.isNewlyConfirmed && result.booking) {
      sendStallMemberAddedSms({
        booking: result.booking,
        memberNames: result.memberNames,
        memberName: result.memberNames?.join(', '),
        amount: result.totalAmount,
      }).catch((smsErr) => {
        console.error('[SMS Dispatch Error] Stall member addition:', smsErr);
      });
    }

    const additionalMembers = await getStallMembersByBookingId(result.booking.id);

    return NextResponse.json({
      success: true,
      booking: result.booking,
      stallMember: result.stallMember,
      stallMembers: result.stallMembers,
      additionalMembers,
      message: `${result.memberNames?.join(', ')} has been added to your official exhibitor team!`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/stalls/booking/[id]/add-member/verify:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
