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

  const message =
    `Namaste ${booking.fullName.trim()}!\n\n` +
    `Your official entry pass for Asha Bani Dandiya Raas 6.0 is confirmed.\n\n` +
    `Booking ID: ${booking.bookingNumber}\n` +
    `Passes: 1 Adult${childrenText}\n` +
    `Included Voucher: Rs. ${voucherAmount}\n` +
    `Date: 13 October 2026 (6:00 PM onwards)\n` +
    `Venue: Maharaja Agrasen Bhavan, Saharanpur\n\n` +
    `View / Download Your Digital Pass:\n${passUrl}`;

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

  const message =
    `Namaste ${booking.bookerName.trim()}!\n\n` +
    `Your stall allotment for Asha Bani Dandiya Raas 6.0 is confirmed.\n\n` +
    `Stall Number: ${booking.stallNumber} (${stallTypeLabel})\n` +
    `Brand: ${booking.brandName}\n` +
    `Booking ID: ${booking.bookingNumber}\n` +
    `Date: 13 October 2026\n` +
    `Venue: Maharaja Agrasen Bhavan, Saharanpur\n\n` +
    `View Your Exhibitor Pass & Live Voucher Settlements:\n${stallPassUrl}`;

  const res = await sendTextBeeSms({
    recipients: [booking.mobile],
    message,
  });

  return res;
}
