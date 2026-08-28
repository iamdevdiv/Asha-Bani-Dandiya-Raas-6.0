import { NextRequest, NextResponse } from 'next/server';
import { getVerifierSession } from '@/lib/verifier-auth';
import { getAdminSession, getAdminFromRequest } from '@/lib/auth';
import { verifyAndCheckInBooking } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Allow either logged in Verifier OR Admin
  const verifier = await getVerifierSession();
  const admin = (await getAdminSession()) || getAdminFromRequest(request);

  if (!verifier && !admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Please log in as an Entry Verifier.' }, { status: 401 });
  }

  const verifierName = verifier?.name || admin?.name || 'Gate Verifier';

  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'QR Code payload or booking reference is required.' }, { status: 400 });
    }

    const result = await verifyAndCheckInBooking(code, verifierName);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('QR Check-in verification error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error verifying pass.' }, { status: 500 });
  }
}
