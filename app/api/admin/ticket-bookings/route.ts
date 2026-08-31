import { NextRequest, NextResponse } from 'next/server';
import { getTicketBookings, prisma } from '@/lib/db';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phaseId = searchParams.get('phaseId') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;

    const bookings = await getTicketBookings({ phaseId, paymentStatus, search });
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Error fetching ticket bookings:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
