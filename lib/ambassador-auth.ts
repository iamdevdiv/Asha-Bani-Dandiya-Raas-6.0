import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const AMBASSADOR_COOKIE_NAME = 'ambassador_auth_token';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET_KEY is not defined in production environment.');
    }
    return 'local_dev_only_ambassador_jwt_secret_do_not_use_in_production';
  }
  return secret;
}

export interface AmbassadorJwtPayload {
  ambassadorId: string;
  name: string;
  mobile: string;
  refCode: string;
}

export function signAmbassadorToken(ambassador: { id: string; name: string; mobile: string; refCode: string }): string {
  return jwt.sign(
    {
      ambassadorId: ambassador.id,
      name: ambassador.name,
      mobile: ambassador.mobile,
      refCode: ambassador.refCode,
    },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
}

export function verifyAmbassadorToken(token: string): AmbassadorJwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AmbassadorJwtPayload;
  } catch {
    return null;
  }
}

export async function getAmbassadorSession(): Promise<AmbassadorJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AMBASSADOR_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAmbassadorToken(token);
  } catch {
    return null;
  }
}

export function getAmbassadorFromRequest(req: NextRequest): AmbassadorJwtPayload | null {
  try {
    const token = req.cookies.get(AMBASSADOR_COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return verifyAmbassadorToken(token);
  } catch {
    return null;
  }
}
