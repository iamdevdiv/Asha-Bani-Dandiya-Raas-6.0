import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import {
  DEFAULT_TEMPLATES,
  getMessageTemplates,
  saveMessageTemplate,
  resetMessageTemplate,
} from '@/lib/message-templates';
import { getAmbassadorTiers, getCurrentActivePhase, getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const templates = await getMessageTemplates();
    const tiers = await getAmbassadorTiers();
    const activePhase = await getCurrentActivePhase();
    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      templates,
      definitions: DEFAULT_TEMPLATES,
      tiers,
      activePhase,
      eventDate: settings.event_date || '13 October 2026',
      venue: `${settings.venue_name || 'Maharaja Agrasen Bhavan'}, ${settings.venue_address || 'Saharanpur'}`,
    });
  } catch (error: any) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { templates, resetKey, resetAll } = body;

    if (resetAll) {
      for (const [key, def] of Object.entries(DEFAULT_TEMPLATES)) {
        await saveMessageTemplate(key, def.defaultText);
      }
      await saveMessageTemplate('template_ambassador_same_for_all', 'true');
      const updated = await getMessageTemplates();
      return NextResponse.json({
        success: true,
        message: 'All message templates have been reset to factory defaults.',
        templates: updated,
      });
    }

    if (resetKey) {
      const def = DEFAULT_TEMPLATES[resetKey];
      if (def) {
        await resetMessageTemplate(resetKey);
      } else if (resetKey === 'template_ambassador_same_for_all') {
        await saveMessageTemplate('template_ambassador_same_for_all', 'true');
      }
      const updated = await getMessageTemplates();
      return NextResponse.json({
        success: true,
        message: `Template "${resetKey}" reset to system default.`,
        templates: updated,
      });
    }

    if (templates && typeof templates === 'object') {
      for (const [k, v] of Object.entries(templates)) {
        if (typeof v === 'string') {
          await saveMessageTemplate(k, v);
        }
      }
    }

    const updated = await getMessageTemplates();
    return NextResponse.json({
      success: true,
      message: 'Message templates saved successfully!',
      templates: updated,
    });
  } catch (error: any) {
    console.error('Error saving message templates:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
