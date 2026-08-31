import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bypassCode } = body;

    if (!bypassCode || typeof bypassCode !== 'string' || !bypassCode.trim()) {
      return NextResponse.json(
        { success: false, valid: false, message: 'Please enter a bypass code.' },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const bypassEnabled = settings.ticket_bypass_code_enabled === 'true';
    const secretCode = (settings.ticket_bypass_secret_code || 'TESTPASS2026').trim().toUpperCase();

    if (!bypassEnabled) {
      return NextResponse.json(
        { success: false, valid: false, message: 'Test payment bypass is currently disabled by admin.' },
        { status: 400 }
      );
    }

    if (bypassCode.trim().toUpperCase() !== secretCode) {
      return NextResponse.json(
        { success: false, valid: false, message: 'Invalid test bypass code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'Test bypass code verified! Payment will be bypassed.',
    });
  } catch (error: any) {
    console.error('Error validating bypass code:', error);
    return NextResponse.json(
      { success: false, valid: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
