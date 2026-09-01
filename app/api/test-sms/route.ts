import { NextRequest, NextResponse } from 'next/server';
import { sendTextBeeSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone') || searchParams.get('mobile');
  const message = searchParams.get('msg') || 'Test message from Asha Bani Dandiya Raas 2026 TextBee integration!';

  if (!phone) {
    return NextResponse.json({
      success: false,
      message: 'Please provide a phone number in query string, e.g. /api/test-sms?phone=9876543210',
    }, { status: 400 });
  }

  console.log('[Test SMS] Manual test triggered for phone:', phone);
  const result = await sendTextBeeSms({
    recipients: [phone],
    message,
  });

  return NextResponse.json({
    success: result.success,
    result,
    instructions: 'Check your terminal console or response data above for details.',
  });
}
