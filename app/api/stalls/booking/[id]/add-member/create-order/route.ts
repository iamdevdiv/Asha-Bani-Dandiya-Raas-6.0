import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, getCurrentActivePhase, createStallMemberOrders } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const rawNames = Array.isArray(body.memberNames)
      ? body.memberNames
      : (body.memberName ? [body.memberName] : []);

    const cleanNames = rawNames
      .map((n: any) => (typeof n === 'string' ? n.trim() : ''))
      .filter((n: string) => n.length >= 2);

    if (cleanNames.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide at least one valid full name for the team member.' },
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
    const totalAmount = adultPrice * cleanNames.length;

    // Generate unique receipt
    const cleanStallNo = (booking.stallNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const receipt = `ABDR-MBR-${cleanStallNo}-${Date.now().toString().slice(-6)}`;

    // Create Razorpay Order
    const order = await createRazorpayOrder({
      amountInInr: totalAmount,
      receipt,
      notes: {
        type: 'stall_add_member',
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        stallNumber: booking.stallNumber,
        memberCount: String(cleanNames.length),
        memberNames: cleanNames.join(', '),
        phaseName: currentPhase?.name || 'Active Phase',
        bookerMobile: booking.mobile,
      },
    });

    // Create pending member order records
    const memberOrders = await createStallMemberOrders({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      stallNumber: booking.stallNumber,
      memberNames: cleanNames,
      pricePerMember: adultPrice,
      phaseId: currentPhase?.id,
      phaseName: currentPhase?.name,
      razorpayOrderId: order.orderId,
    });

    return NextResponse.json({
      success: true,
      memberOrderIds: memberOrders.map((m) => m.id),
      memberOrderId: memberOrders[0]?.id,
      orderId: order.orderId,
      amount: totalAmount,
      pricePerMember: adultPrice,
      memberCount: cleanNames.length,
      memberNames: cleanNames,
      currency: 'INR',
      keyId: order.keyId,
      isMock: order.isMock,
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

