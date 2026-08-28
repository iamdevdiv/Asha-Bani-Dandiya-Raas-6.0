import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getUserByMobile } from './db';

const VERIFIER_COOKIE_NAME = 'verifier_auth_token';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET_KEY is not defined in production environment.');
    }
    return 'local_dev_only_verifier_jwt_secret_do_not_use_in_production';
  }
  return secret;
}

export function signVerifierToken(user: { id: string; name: string; mobile: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
}

export function verifyVerifierToken(token: string): { userId: string; name: string; mobile: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; name: string; mobile: string; role: string };
  } catch (err) {
    return null;
  }
}

export async function getVerifierSession(): Promise<{ userId: string; name: string; mobile: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(VERIFIER_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyVerifierToken(token);
  } catch (err) {
    return null;
  }
}

export async function verifyUserCredentials(mobile: string, plainPass: string) {
  const user = await getUserByMobile(mobile);
  if (!user || !user.isActive) return null;

  const valid = bcrypt.compareSync(plainPass, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    role: user.role,
  };
}

export { VERIFIER_COOKIE_NAME };
