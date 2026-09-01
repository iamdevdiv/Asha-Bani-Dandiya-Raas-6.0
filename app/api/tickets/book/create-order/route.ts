import { NextRequest, NextResponse } from 'next/server';
import {
  createTicketBookingRecord,
  completeTicketBookingPayment,
  getAmbassadorById,
  getSettings,
  getCurrentActivePhase,
  validateAndApplyCoupon,
  recordCouponUsage,
} from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';
import { sendTicketBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, mobile, email, address, childrenNames, ref, couponCode, bypassCode } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, message: 'Full name is required' }, { status: 400 });
    }

    const rawDigits = (mobile || '').replace(/\D/g, '');
    const cleanMobile = rawDigits.length === 12 && rawDigits.startsWith('91') ? rawDigits.slice(2) : rawDigits;
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9' }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({ success: false, message: 'Address is required' }, { status: 400 });
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ success: false, message: 'Please enter a valid email address' }, { status: 400 });
      }
    }

    // Children limit validation
    const settings = await getSettings();
    const maxChildren = parseInt(settings.max_children_per_ticket || '3', 10);
    const validChildren = Array.isArray(childrenNames)
      ? childrenNames.filter((name: any) => typeof name === 'string' && name.trim().length > 0)
      : [];

    if (validChildren.length > maxChildren) {
      return NextResponse.json(
        { success: false, message: `Maximum ${maxChildren} children allowed per ticket` },
        { status: 400 }
      );
    }

    // Find ambassador if referral code passed
    let referredByAmbassadorId: string | undefined;
    if (ref && typeof ref === 'string') {
      const amb = await getAmbassadorById(ref.trim());
      if (amb && amb.status === 'approved') {
        referredByAmbassadorId = amb.id;
      }
    }

    // Calculate base total for coupon validation
    const phase = await getCurrentActivePhase();
    const adultPrice = phase.adultPrice || 499;
    const childPrice = phase.childPrice || 199;
    const baseTotal = adultPrice * 1 + childPrice * validChildren.length;

    let appliedCouponCode: string | undefined;
    let discountAmount = 0;

    const rawCoupon = couponCode || bypassCode;
    if (rawCoupon && typeof rawCoupon === 'string' && rawCoupon.trim().length > 0) {
      const couponRes = await validateAndApplyCoupon(rawCoupon.trim(), baseTotal);
      if (!couponRes.isValid) {
        return NextResponse.json({ success: false, message: couponRes.message }, { status: 400 });
      }

      appliedCouponCode = couponRes.coupon?.code;
      discountAmount = couponRes.discountAmount || 0;

      // 100% Free Pass (Coupon makes payable amount 0)
      if (couponRes.isFreePass || couponRes.finalAmount === 0) {
        const booking = await createTicketBookingRecord({
          fullName: fullName.trim(),
          mobile: cleanMobile,
          email: email ? email.trim() : undefined,
          address: address.trim(),
          adultCount: 1,
          childrenCount: validChildren.length,
          childrenNames: validChildren,
          referredByAmbassadorId,
          couponCode: appliedCouponCode,
          discountAmount,
        });

        // Complete payment immediately
        const completedBooking = await completeTicketBookingPayment({
          bookingId: booking.id,
          razorpayOrderId: `FREE_COUPON_${appliedCouponCode}`,
          razorpayPaymentId: `PAY_FREE_${Date.now()}`,
          razorpaySignature: 'COUPON_FREE_AUTHORIZED',
        });

        // Track usage
        if (couponRes.coupon?.id) {
          await recordCouponUsage(couponRes.coupon.id);
        }

        // Fire SMS for free coupon pass
        sendTicketBookingSms(completedBooking).catch((smsErr) => {
          console.error('[SMS Dispatch Error] Free coupon ticket booking:', smsErr);
        });

        return NextResponse.json({
          success: true,
          bypass: true,
          isFreePass: true,
          bookingId: completedBooking.id,
          bookingNumber: completedBooking.bookingNumber,
          passUrl: `/dandiyaraas/tickets/pass/${completedBooking.id}`,
          message: 'Free entry pass issued successfully!',
        });
      }
    }

    // Create pending TicketBooking record with discount applied
    const booking = await createTicketBookingRecord({
      fullName: fullName.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : undefined,
      address: address.trim(),
      adultCount: 1,
      childrenCount: validChildren.length,
      childrenNames: validChildren,
      referredByAmbassadorId,
      couponCode: appliedCouponCode,
      discountAmount,
    });

    // Create Razorpay Order with discounted amount
    const razorpayOrder = await createRazorpayOrder({
      amountInInr: booking.totalAmount,
      receipt: booking.bookingNumber,
      notes: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        attendeeName: booking.fullName,
        type: 'CUSTOMER_TICKET',
        coupon: appliedCouponCode || 'none',
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      amount: booking.totalAmount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.orderId,
      razorpayKeyId: razorpayOrder.keyId,
      isMock: razorpayOrder.isMock,
    });
  } catch (error: any) {
    console.error('Error creating ticket order:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
