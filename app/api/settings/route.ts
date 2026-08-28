import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
