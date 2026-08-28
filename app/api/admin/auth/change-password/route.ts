import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminFromRequest } from '@/lib/auth';
import { getAdminByEmail, updateAdminPassword } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Please provide both current and new password.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const admin = await getAdminByEmail(adminSession.email);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin account not found.' }, { status: 404 });
    }

    const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Current password does not match.' },
        { status: 400 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);
    await updateAdminPassword(adminSession.email, newHash);

    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update password.' },
      { status: 500 }
    );
  }
}
