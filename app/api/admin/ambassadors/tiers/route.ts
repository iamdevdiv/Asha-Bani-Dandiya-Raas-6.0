import { NextRequest, NextResponse } from 'next/server';
import { getAmbassadorTiers, saveAmbassadorTier } from '@/lib/db';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const tiers = await getAmbassadorTiers();
    return NextResponse.json({ success: true, tiers });
  } catch (error: any) {
    console.error('Error fetching ambassador tiers:', error);
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
    if (!body.name || !body.referralsRequired || body.voucherAmount === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required tier fields' }, { status: 400 });
    }

    const saved = await saveAmbassadorTier(body);
    return NextResponse.json({ success: true, tier: saved, message: 'Ambassador tier saved successfully' });
  } catch (error: any) {
    console.error('Error saving ambassador tier:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
