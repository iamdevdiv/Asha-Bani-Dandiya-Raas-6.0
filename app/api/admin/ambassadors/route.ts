import { NextRequest, NextResponse } from 'next/server';
import { getAmbassadors, approveAmbassador } from '@/lib/db';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const ambassadors = await getAmbassadors();
    return NextResponse.json({ success: true, ambassadors });
  } catch (error: any) {
    console.error('Error fetching admin ambassadors:', error);
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
    const { id, password, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Ambassador ID is required' }, { status: 400 });
    }

    const updated = await approveAmbassador(id, password, status || 'approved');
    return NextResponse.json({
      success: true,
      ambassador: updated,
      message: status === 'approved' ? 'Ambassador approved and credentials updated' : 'Ambassador updated',
    });
  } catch (error: any) {
    console.error('Error updating ambassador:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
