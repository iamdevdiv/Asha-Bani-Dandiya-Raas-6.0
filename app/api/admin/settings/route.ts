import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { getSettings, updateSetting, getTicketPhases } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req) || (await getAdminSession());
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req) || (await getAdminSession());
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settingsObj = await req.json();

    // Validation: Global ticket opening date cannot be after Phase 1 end date
    if (settingsObj.ticket_booking_start_date) {
      const phases = await getTicketPhases();
      const phase1 = phases.find((p: any) => p.phaseNumber === 1);
      if (phase1 && phase1.endDate && settingsObj.ticket_booking_start_date > phase1.endDate) {
        return NextResponse.json(
          {
            success: false,
            message: `Global ticket opening date (${settingsObj.ticket_booking_start_date}) cannot be after Phase 1 end date (${phase1.endDate}). Please update Phase 1 dates first.`,
          },
          { status: 400 }
        );
      }
    }

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
