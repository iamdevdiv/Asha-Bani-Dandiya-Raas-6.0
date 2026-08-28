import { NextRequest, NextResponse } from 'next/server';
import { getStallByNumber, createBooking } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      stallNumber,
      bookerName,
      brandName,
      email,
      mobile,
      stallType,
      teamMembers,
    } = body;

    // Server-side validation
    if (!bookerName || typeof bookerName !== 'string' || bookerName.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Please provide a valid full name.' }, { status: 400 });
    }

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    if (!brandName || typeof brandName !== 'string' || brandName.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Please enter your brand or business name.' }, { status: 400 });
    }

    if (!stallType || typeof stallType !== 'string' || stallType.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Please specify the type of stall.' }, { status: 400 });
    }

    if (!teamMembers || typeof teamMembers !== 'string' || teamMembers.trim().length < 1) {
      return NextResponse.json({ success: false, message: 'Please mention team members attending the stall.' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!stallNumber) {
      return NextResponse.json({ success: false, message: 'Please select a stall from the interactive layout.' }, { status: 400 });
    }

    // Verify stall existence & availability
    const stall = await getStallByNumber(stallNumber);
    if (!stall) {
      return NextResponse.json({ success: false, message: `Stall ${stallNumber} does not exist.` }, { status: 400 });
    }

    if (stall.isBooked) {
      return NextResponse.json(
        { success: false, message: `Stall ${stallNumber} has already been reserved. Please select another stall.` },
        { status: 400 }
      );
    }

    const bookingNumber = `ABDR-STALL-${stall.stallNumber.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amountInInr: stall.price,
      receipt: bookingNumber,
      notes: {
        stallNumber: stall.stallNumber,
        brandName: brandName.trim(),
        bookerName: bookerName.trim(),
        mobile: mobile.trim(),
      },
    });

    // Create pending booking
    const booking = await createBooking({
      bookingNumber,
      stallNumber: stall.stallNumber,
      amount: stall.price,
      bookerName: bookerName.trim(),
      brandName: brandName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      stallType: stallType.trim(),
      teamMembers: teamMembers.trim(),
      razorpayOrderId: order.orderId,
      paymentStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      orderId: order.orderId,
      amount: stall.price,
      currency: 'INR',
      keyId: order.keyId,
      isMock: order.isMock,
    });
  } catch (error: any) {
    console.error('Error in POST /api/stalls/create-order:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate order.' },
      { status: 500 }
    );
  }
}
