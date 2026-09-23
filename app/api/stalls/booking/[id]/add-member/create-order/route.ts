import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, getCurrentActivePhase, createStallMemberOrder } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { memberName } = body;

    if (!memberName || typeof memberName !== 'string' || memberName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid full name for the team member.' },
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

    // Retrieve active phase for ticket pricing
    const currentPhase = await getCurrentActivePhase();
    const adultPrice = currentPhase?.adultPrice || 499;
    const cleanMemberName = memberName.trim();

    // Generate unique receipt
    const cleanStallNo = (booking.stallNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const receipt = `ABDR-MBR-${cleanStallNo}-${Date.now().toString().slice(-6)}`;

    // Create Razorpay Order
    const order = await createRazorpayOrder({
      amountInInr: adultPrice,
      receipt,
      notes: {
        type: 'stall_add_member',
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        stallNumber: booking.stallNumber,
        memberName: cleanMemberName,
        phaseName: currentPhase?.name || 'Active Phase',
        bookerMobile: booking.mobile,
      },
    });

    // Create pending member order record
    const memberOrder = await createStallMemberOrder({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      stallNumber: booking.stallNumber,
      memberName: cleanMemberName,
      amount: adultPrice,
      phaseId: currentPhase?.id,
      phaseName: currentPhase?.name,
      razorpayOrderId: order.orderId,
    });

    return NextResponse.json({
      success: true,
      memberOrderId: memberOrder.id,
      orderId: order.orderId,
      amount: adultPrice,
      currency: 'INR',
      keyId: order.keyId,
      isMock: order.isMock,
      memberName: cleanMemberName,
      phaseName: currentPhase?.name || 'Active Phase',
    });
  } catch (error: any) {
    console.error('Error in POST /api/stalls/booking/[id]/add-member/create-order:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate member purchase.' },
      { status: 500 }
    );
  }
}
