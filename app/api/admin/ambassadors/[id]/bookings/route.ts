import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { getAmbassadorReferredBookings, getAmbassadorById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Ambassador ID is required' }, { status: 400 });
    }

    const ambassador = await getAmbassadorById(id);
    if (!ambassador) {
      return NextResponse.json({ success: false, message: 'Ambassador not found' }, { status: 404 });
    }

    const bookings = await getAmbassadorReferredBookings(id);

    return NextResponse.json({
      success: true,
      ambassador: {
        id: ambassador.id,
        name: ambassador.name,
        refCode: ambassador.refCode,
        mobile: ambassador.mobile,
      },
      bookings,
    });
  } catch (error: any) {
    console.error('Error fetching referred bookings:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
