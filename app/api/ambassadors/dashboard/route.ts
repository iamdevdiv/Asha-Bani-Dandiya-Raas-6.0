import { NextRequest, NextResponse } from 'next/server';
import { getAmbassadorSession, getAmbassadorFromRequest } from '@/lib/ambassador-auth';
import { getAmbassadorDashboardData } from '@/lib/db';
import { getMessageTemplates, DEFAULT_TEMPLATES } from '@/lib/message-templates';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = (await getAmbassadorSession()) || getAmbassadorFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await getAmbassadorDashboardData(session.ambassadorId);
    if (!data) {
      return NextResponse.json({ success: false, message: 'Ambassador record not found' }, { status: 404 });
    }

    const templates = await getMessageTemplates();
    const shareMessageTemplate =
      templates.template_ambassador_share_wa || DEFAULT_TEMPLATES.template_ambassador_share_wa.defaultText;

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        shareMessageTemplate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching ambassador dashboard:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

