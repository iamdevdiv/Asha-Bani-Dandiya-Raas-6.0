import { NextRequest, NextResponse } from 'next/server';
import { verifyUserCredentials, signVerifierToken, VERIFIER_COOKIE_NAME } from '@/lib/verifier-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, message: 'Mobile number and password are required.' },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const user = await verifyUserCredentials(cleanMobile, password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or inactive account.' },
        { status: 401 }
      );
    }

    const token = signVerifierToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
      message: 'Login successful',
    });

    response.cookies.set(VERIFIER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Verifier login error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
