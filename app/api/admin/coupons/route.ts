import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await getCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.code || !body.code.trim()) {
      return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
    }

    const created = await createCoupon({
      code: body.code,
      description: body.description,
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue) || 0,
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : 0,
      expiresAt: body.expiresAt || null,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ success: true, coupon: created, message: 'Coupon created successfully' });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create coupon' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Coupon ID is required' }, { status: 400 });
    }

    const updated = await updateCoupon(body.id, {
      code: body.code,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
      maxUses: body.maxUses !== undefined ? (body.maxUses ? Number(body.maxUses) : null) : undefined,
      minOrderAmount: body.minOrderAmount !== undefined ? Number(body.minOrderAmount) : undefined,
      expiresAt: body.expiresAt !== undefined ? body.expiresAt : undefined,
      isActive: body.isActive !== undefined ? body.isActive : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon: updated, message: 'Coupon updated successfully' });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update coupon' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Coupon ID is required' }, { status: 400 });
    }

    const success = await deleteCoupon(id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete coupon' }, { status: 400 });
  }
}
