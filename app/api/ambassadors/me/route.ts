import { NextResponse } from 'next/server';
import { getAmbassadorSession } from '@/lib/ambassador-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAmbassadorSession();
    if (!session) {
      return NextResponse.json({ success: false, authenticated: false });
    }
    return NextResponse.json({
      success: true,
      authenticated: true,
      ambassador: {
        id: session.ambassadorId,
        name: session.name,
        mobile: session.mobile,
        refCode: session.refCode,
      },
    });
  } catch {
    return NextResponse.json({ success: false, authenticated: false });
  }
}
