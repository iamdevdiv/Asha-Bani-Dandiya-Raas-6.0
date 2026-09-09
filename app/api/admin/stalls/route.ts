import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { getStalls, updateStall, updateStallCategoryPrices } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const stalls = await getStalls();
  return NextResponse.json({ success: true, stalls });
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check for bulk category & badge pricing update
    if (body.action === 'update_category_pricing' || body.categoryPrices) {
      const prices = body.categoryPrices || body;
      const updatedStalls = await updateStallCategoryPrices({
        foodPrice: prices.foodPrice !== undefined ? Number(prices.foodPrice) : undefined,
        cjPrice: prices.cjPrice !== undefined ? Number(prices.cjPrice) : undefined,
        turningPrice: prices.turningPrice !== undefined ? Number(prices.turningPrice) : undefined,
        frontPrice: prices.frontPrice !== undefined ? Number(prices.frontPrice) : undefined,
      });
      return NextResponse.json({ success: true, stalls: updatedStalls });
    }

    const {
      stallNumber,
      price,
      isBooked,
      bookedByName,
      bookedByBrand,
      bookedByMobile,
      bookedByEmail,
    } = body;

    if (!stallNumber) {
      return NextResponse.json({ success: false, message: 'Stall number is required.' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (price !== undefined) {
      updatePayload.price = Number(price);
    }
    if (typeof isBooked === 'boolean') {
      updatePayload.isBooked = isBooked;
      if (isBooked) {
        updatePayload.bookedByName = bookedByName || null;
        updatePayload.bookedByBrand = bookedByBrand || null;
        updatePayload.bookedByMobile = bookedByMobile || null;
        updatePayload.bookedByEmail = bookedByEmail || null;
      } else {
        updatePayload.bookedByName = null;
        updatePayload.bookedByBrand = null;
        updatePayload.bookedByMobile = null;
        updatePayload.bookedByEmail = null;
        updatePayload.bookingId = null;
      }
    }

    const updated = await updateStall(stallNumber, updatePayload);

    return NextResponse.json({ success: true, stall: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update stall.' },
      { status: 500 }
    );
  }
}
