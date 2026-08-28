import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { getStalls, updateStall } from '@/lib/db';

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
    const {
      stallNumber,
      price,
      isBooked,
      bookedByName,
      bookedByBrand,
      bookedByMobile,
      bookedByEmail,
    } = await req.json();

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
