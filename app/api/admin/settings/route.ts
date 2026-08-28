import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { getSettings, updateSetting } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settingsObj = await req.json();
    for (const [key, value] of Object.entries(settingsObj)) {
      if (typeof value === 'string') {
        await updateSetting(key, value);
      }
    }

    const updated = await getSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update settings.' },
      { status: 500 }
    );
  }
}
