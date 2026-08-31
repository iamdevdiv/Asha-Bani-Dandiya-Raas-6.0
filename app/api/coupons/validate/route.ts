import { NextRequest, NextResponse } from 'next/server';
import { validateAndApplyCoupon } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json();
    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Please enter a coupon code' }, { status: 400 });
    }

    const orderAmount = Number(amount) || 0;
    const result = await validateAndApplyCoupon(code, orderAmount);

    if (!result.isValid || !result.coupon) {
      return NextResponse.json({ success: false, message: result.message || 'Invalid coupon' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: result.coupon.code,
        description: result.coupon.description,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
      },
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      isFreePass: result.isFreePass,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
