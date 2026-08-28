import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminByEmail } from '@/lib/db';
import { signAdminToken, setAdminAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const admin = await getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      email: admin.email,
      name: admin.name,
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      admin: { email: admin.email, name: admin.name },
      token,
    });

    setAdminAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
