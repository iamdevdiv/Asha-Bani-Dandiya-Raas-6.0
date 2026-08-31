import { NextRequest, NextResponse } from 'next/server';
import { submitAmbassadorApplication, getAmbassadorById, getAmbassadorTiers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tiers = await getAmbassadorTiers();
    return NextResponse.json({ success: true, tiers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, mobile, email, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Full name is required' }, { status: 400 });
    }

    const rawDigits = (mobile || '').replace(/\D/g, '');
    const cleanMobile = rawDigits.length === 12 && rawDigits.startsWith('91') ? rawDigits.slice(2) : rawDigits;
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address' }, { status: 400 });
    }

    // Check for existing application
    const existing = await getAmbassadorById(cleanMobile);
    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json(
          { success: false, message: 'You are already registered as an Ambassador. Please login.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'An application with this mobile number is already under review.' },
        { status: 400 }
      );
    }

    const application = await submitAmbassadorApplication({
      name: name.trim(),
      mobile: cleanMobile,
      email: email.trim(),
      notes: notes ? notes.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      refCode: application.refCode,
      message: 'Ambassador application submitted successfully! Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Error submitting ambassador application:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
