import { NextRequest, NextResponse } from 'next/server';
import { ambassadorLogin } from '@/lib/db';
import { signAmbassadorToken } from '@/lib/ambassador-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json({ success: false, message: 'Mobile and password are required' }, { status: 400 });
    }

    const res = await ambassadorLogin(mobile, password);
    if (!res.success || !res.ambassador) {
      return NextResponse.json({ success: false, message: res.message || 'Login failed' }, { status: 401 });
    }

    const token = signAmbassadorToken(res.ambassador);
    const response = NextResponse.json({
      success: true,
      ambassador: {
        id: res.ambassador.id,
        name: res.ambassador.name,
        mobile: res.ambassador.mobile,
        refCode: res.ambassador.refCode,
      },
      message: 'Login successful',
    });

    response.cookies.set('ambassador_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Ambassador login error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
