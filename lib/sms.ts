/**
 * TextBee SMS Gateway Integration for Asha Bani Dandiya Raas 2026.
 * Uses TextBee Android SMS Gateway API (https://textbee.dev)
 * No DLT registration required.
 */

import fs from 'fs';
import path from 'path';

interface SendSmsOptions {
  recipients: string[];
  message: string;
  deviceId?: string;
  simSubscriptionId?: number | string;
}

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!.trim();

  // Dynamic fallback: read .env directly from disk to pick up runtime updates
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (k === key) return v;
        }
      }
    }
  } catch (err) {
    console.warn('[TextBee SMS] Could not read .env file directly:', err);
  }
  return '';
}

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (phone.startsWith('+')) {
    return phone.trim();
  }
  return `+91${digits.slice(-10)}`;
}

export async function sendTextBeeSms(options: SendSmsOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log('[TextBee SMS DEBUG] === Initiating SMS Dispatch ===');

  const apiKey = getEnvValue('TEXTBEE_API_KEY');
  if (!apiKey) {
    console.warn('[TextBee SMS DEBUG] ❌ TEXTBEE_API_KEY is missing or empty in environment / .env file!');
    return { success: false, error: 'TEXTBEE_API_KEY is not configured in .env' };
  }

  const deviceId = options.deviceId || getEnvValue('TEXTBEE_DEVICE_ID');
  const rawSim = options.simSubscriptionId !== undefined
    ? options.simSubscriptionId
    : (getEnvValue('TEXTBEE_SIM_ID') || getEnvValue('TEXTBEE_SIM_SUBSCRIPTION_ID'));

  const formattedRecipients = options.recipients.map(normalizeIndianPhone);

  const payload: any = {
    recipients: formattedRecipients,
    message: options.message,
  };

  if (deviceId && deviceId.trim()) {
    payload.deviceId = deviceId.trim();
  }

  if (rawSim !== undefined && rawSim !== null && String(rawSim).trim() !== '') {
    const parsedSim = Number(rawSim);
    payload.simSubscriptionId = !isNaN(parsedSim) ? parsedSim : String(rawSim).trim();
  }

  console.log('[TextBee SMS DEBUG] Target URL: https://api.textbee.dev/api/v1/gateway/send-sms');
  console.log('[TextBee SMS DEBUG] API Key Present:', apiKey ? `Yes (starts with: ${apiKey.slice(0, 6)}...)` : 'No');
  console.log('[TextBee SMS DEBUG] Payload:', JSON.stringify(payload, null, 2));

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.textbee.dev/api/v1/gateway/send-sms', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;
    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    console.log(`[TextBee SMS DEBUG] Response Status: ${response.status} ${response.statusText} (${elapsed}ms)`);
    console.log('[TextBee SMS DEBUG] Response Body:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`[TextBee SMS DEBUG] ❌ API returned error (${response.status}):`, data);
      return { success: false, error: data.message || `HTTP ${response.status}: ${responseText}` };
    }

    console.log('[TextBee SMS DEBUG] ✅ SMS successfully queued/dispatched by TextBee Gateway to:', formattedRecipients);
    return { success: true, data };
  } catch (err: any) {
    console.error('[TextBee SMS DEBUG] ❌ Network/Fetch Exception during SMS dispatch:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

import { getSettings } from './db';
import { getMessageTemplates, renderMessageTemplate, getVoucherUsabilityLabel, DEFAULT_TEMPLATES } from './message-templates';

/**
 * Send customer booking confirmation SMS with digital pass link
 */
export async function sendTicketBookingSms(booking: {
  id: string;
  fullName: string;
  mobile: string;
  bookingNumber: string;
  adultCount?: number;
  childrenCount?: number;
  voucherAmount?: number;
  totalAmount?: number;
  voucherApplicableTo?: string;
}) {
  console.log('[TextBee SMS DEBUG] Triggering Ticket Booking SMS for booking:', booking.bookingNumber, 'Mobile:', booking.mobile);

  if (!booking.mobile) {
    console.warn('[TextBee SMS DEBUG] ❌ No mobile number found for booking:', booking.bookingNumber);
    return;
  }

  const baseUrl = getEnvValue('NEXT_PUBLIC_BASE_URL') || 'https://ashabani.com';
  const passUrl = `${baseUrl}/dandiyaraas/tickets/pass/${booking.id}`;
  const childrenText = (booking.childrenCount || 0) > 0 ? ` + ${booking.childrenCount} Children` : '';
  const voucherAmount = booking.voucherAmount !== undefined ? booking.voucherAmount : 100;

  // Pass pricing / gift status
  let priceLine = '';
  if (booking.totalAmount === 0) {
    priceLine = 'Pass Type: Complimentary / Gift Pass (Rs. 0)\n';
  } else if (booking.totalAmount !== undefined && booking.totalAmount > 0) {
    priceLine = `Amount Paid: Rs. ${booking.totalAmount}\n`;
  }

  // Stall voucher status
  const voucherLine = voucherAmount > 0
    ? `Included Voucher: Rs. ${voucherAmount}\n`
    : `Stall Voucher: None (Rs. 0)\n`;

  const settings = await getSettings();
  const templates = await getMessageTemplates();
  const templateStr = templates.template_ticket_sms || DEFAULT_TEMPLATES.template_ticket_sms.defaultText;

  const eventDate = settings.event_date || '13 October 2026 (6:00 PM onwards)';
  const venue = `${settings.venue_name || 'Maharaja Agrasen Bhavan'}, ${settings.venue_address || 'Saharanpur'}`;
  const passesText = `1 Adult${childrenText}`;
  const usability = getVoucherUsabilityLabel(booking.voucherApplicableTo || settings.ticket_voucher_applicable_to);

  const message = renderMessageTemplate(templateStr, {
    name: booking.fullName.trim(),
    booking_id: booking.bookingNumber,
    price_line: priceLine,
    passes_text: passesText,
    voucher_line: voucherLine,
    voucher_amount: voucherAmount,
    voucher_usability: usability,
    event_date: eventDate,
    venue,
    pass_link: passUrl,
  });

  const res = await sendTextBeeSms({
    recipients: [booking.mobile],
    message,
  });

  return res;
}

/**
 * Send stall owner confirmation SMS with exhibitor pass link
 */
export async function sendStallBookingSms(booking: {
  id: string;
  bookerName: string;
  brandName: string;
  stallNumber: string;
  stallType?: string;
  mobile: string;
  bookingNumber: string;
}) {
  console.log('[TextBee SMS DEBUG] Triggering Stall Booking SMS for booking:', booking.bookingNumber, 'Mobile:', booking.mobile);

  if (!booking.mobile) {
    console.warn('[TextBee SMS DEBUG] ❌ No mobile number found for stall booking:', booking.bookingNumber);
    return;
  }

  const baseUrl = getEnvValue('NEXT_PUBLIC_BASE_URL') || 'https://ashabani.com';
  const stallPassUrl = `${baseUrl}/dandiyaraas/stall/pass/${booking.id}`;
  const stallTypeLabel = booking.stallType === 'food' ? 'Food Canopy' : 'Commercial Canopy';

  const settings = await getSettings();
  const templates = await getMessageTemplates();
  const templateStr = templates.template_stall_sms || DEFAULT_TEMPLATES.template_stall_sms.defaultText;

  const eventDate = settings.event_date || '13 October 2026';
  const venue = `${settings.venue_name || 'Maharaja Agrasen Bhavan'}, ${settings.venue_address || 'Saharanpur'}`;

  const message = renderMessageTemplate(templateStr, {
    name: booking.bookerName.trim(),
    stall_number: booking.stallNumber,
    stall_type: stallTypeLabel,
    brand_name: booking.brandName,
    booking_id: booking.bookingNumber,
    event_date: eventDate,
    venue,
    pass_link: stallPassUrl,
  });

  const res = await sendTextBeeSms({
    recipients: [booking.mobile],
    message,
  });

  return res;
}

/**
 * Send ambassador milestone & tier unlocked confirmation SMS with pass details
 */
export async function sendAmbassadorTierUnlockedSms(params: {
  ambassadorName: string;
  mobile: string;
  tierName: string;
  tierLevel: number;
  referralCount: number;
  voucherAmount?: number;
  bookingNumber?: string;
  bookingId?: string;
  refCode?: string;
}) {
  console.log('[TextBee SMS DEBUG] Triggering Ambassador Tier Unlocked SMS for:', params.ambassadorName, 'Mobile:', params.mobile);

  if (!params.mobile) {
    console.warn('[TextBee SMS DEBUG] ❌ No mobile number found for ambassador:', params.ambassadorName);
    return;
  }

  const baseUrl = getEnvValue('NEXT_PUBLIC_BASE_URL') || 'https://ashabani.com';
  const dashboardUrl = `${baseUrl}/ambassador/dashboard`;
  const passUrl = params.bookingId ? `${baseUrl}/dandiyaraas/tickets/pass/${params.bookingId}` : null;

  let rewardLines = '';
  if (params.bookingNumber && passUrl) {
    rewardLines += `Complimentary Entry Pass: ${params.bookingNumber}\n`;
    if (params.voucherAmount && params.voucherAmount > 0) {
      rewardLines += `Included Stall Voucher: Rs. ${params.voucherAmount}\n`;
    }
    rewardLines += `Download Your Digital Pass:\n${passUrl}\n\n`;
  } else if (params.voucherAmount && params.voucherAmount > 0) {
    rewardLines += `Milestone Stall Voucher: Rs. ${params.voucherAmount}\n\n`;
  }

  const templates = await getMessageTemplates();
  const isSameForAll = templates.template_ambassador_same_for_all !== 'false';

  let templateStr = templates.template_ambassador_common_sms || DEFAULT_TEMPLATES.template_ambassador_common_sms.defaultText;
  if (!isSameForAll) {
    const tierKey = `template_ambassador_tier_${params.tierLevel}_sms`;
    if (templates[tierKey]) {
      templateStr = templates[tierKey];
    } else if (DEFAULT_TEMPLATES[tierKey]) {
      templateStr = DEFAULT_TEMPLATES[tierKey].defaultText;
    }
  }

  const message = renderMessageTemplate(templateStr, {
    ambassador_name: params.ambassadorName.trim(),
    tier_name: params.tierName,
    tier_level: params.tierLevel,
    referral_count: params.referralCount,
    voucher_amount: params.voucherAmount || 0,
    reward_lines: rewardLines,
    booking_number: params.bookingNumber || '',
    pass_link: passUrl || '',
    dashboard_url: dashboardUrl,
  });

  const res = await sendTextBeeSms({
    recipients: [params.mobile],
    message,
  });

  return res;
}


