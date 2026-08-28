import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET_KEY is not defined in production environment.');
    }
    return 'local_dev_only_jwt_secret_do_not_use_in_production';
  }
  return secret;
}

const AUTH_COOKIE_NAME = 'asha_dandiya_admin_token';

export interface AdminJwtPayload {
  email: string;
  name: string;
  role: 'admin';
}

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest): AdminJwtPayload | null {
  const tokenFromCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = req.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export function setAdminAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAdminAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
