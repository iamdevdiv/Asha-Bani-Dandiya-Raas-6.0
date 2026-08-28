import { NextRequest, NextResponse } from 'next/server';
import { clearAdminAuthCookie, getAdminFromRequest } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out.' });
  clearAdminAuthCookie(response);
  return response;
}
