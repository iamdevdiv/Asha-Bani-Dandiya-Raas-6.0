import { NextRequest, NextResponse } from 'next/server';
import { getAmbassadorSession, getAmbassadorFromRequest } from '@/lib/ambassador-auth';
import { getAmbassadorDashboardData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = (await getAmbassadorSession()) || getAmbassadorFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await getAmbassadorDashboardData(session.ambassadorId);
    if (!data) {
      return NextResponse.json({ success: false, message: 'Ambassador record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching ambassador dashboard:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
