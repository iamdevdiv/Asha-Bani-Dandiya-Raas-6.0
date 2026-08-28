import { NextRequest, NextResponse } from 'next/server';
import { getVerifierSession } from '@/lib/verifier-auth';
import { getAdminSession, getAdminFromRequest } from '@/lib/auth';
import { verifyAndCheckInBooking } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('\n=================== [QR SCAN VERIFICATION API] ===================');
  // Allow either logged in Verifier OR Admin
  const verifier = await getVerifierSession();
  const admin = (await getAdminSession()) || getAdminFromRequest(request);

  if (!verifier && !admin) {
    console.warn('[QR SCAN API] ❌ Unauthorized request - no active session found.');
    return NextResponse.json({ success: false, message: 'Unauthorized. Please log in as an Entry Verifier.' }, { status: 401 });
  }

  const verifierName = verifier?.name || admin?.name || 'Gate Verifier';
  console.log(`[QR SCAN API] 👤 Authenticated Verifier: ${verifierName}`);

  try {
    const body = await request.json();
    const { code } = body;

    console.log(`[QR SCAN API] 📥 Received QR Code Payload:`, code);

    if (!code || typeof code !== 'string') {
      console.warn('[QR SCAN API] ❌ Empty or invalid QR payload received.');
      return NextResponse.json({ success: false, message: 'QR Code payload or booking reference is required.' }, { status: 400 });
    }

    const result = await verifyAndCheckInBooking(code, verifierName);
    console.log(`[QR SCAN API] ✅ Verification Result:`, JSON.stringify(result, null, 2));
    console.log('==================================================================\n');
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[QR SCAN API] 💥 Server Exception:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error verifying pass.' }, { status: 500 });
  }
}
