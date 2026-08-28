import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, getAdminFromRequest } from '@/lib/auth';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = (await getAdminSession()) || getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = (await getAdminSession()) || getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, mobile, password, role } = body;

    if (!name || !mobile || !password) {
      return NextResponse.json({ success: false, message: 'Name, mobile, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return NextResponse.json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number.' }, { status: 400 });
    }

    const user = await createUser({
      name,
      mobile: cleanMobile,
      password,
      role: role || 'entry_verifier',
    });

    return NextResponse.json({ success: true, user, message: 'User created successfully' });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to create user' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = (await getAdminSession()) || getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, mobile, password, isActive, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const user = await updateUser(id, { name, mobile, password, isActive, role });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user, message: 'User updated successfully' });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to update user' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = (await getAdminSession()) || getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    await deleteUser(id);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
