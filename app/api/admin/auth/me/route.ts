import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req) || (await getAdminSession());
  if (!admin) {
    return NextResponse.json({ success: false, authenticated: false, message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: true, authenticated: true, admin });
}
