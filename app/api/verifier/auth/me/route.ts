import { NextRequest, NextResponse } from 'next/server';
import { getVerifierSession } from '@/lib/verifier-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getVerifierSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: session,
  });
}
