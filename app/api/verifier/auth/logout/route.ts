import { NextRequest, NextResponse } from 'next/server';
import { VERIFIER_COOKIE_NAME } from '@/lib/verifier-auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(VERIFIER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
