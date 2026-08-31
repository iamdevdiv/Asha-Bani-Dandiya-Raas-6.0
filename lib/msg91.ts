/**
 * MSG91 Transactional SMS Service
 * Documentation: https://docs.msg91.com/sms/send-sms
 */

export interface TicketSmsParams {
  mobile: string;
  name: string;
  bookingNumber: string;
  bookingId: string;
  amount?: number;
  voucherBalance?: number;
  eventDate?: string;
  venue?: string;
}

export interface StallSmsParams {
  mobile: string;
  bookerName: string;
  brandName?: string;
  stallNumber: string;
  bookingNumber: string;
  bookingId: string;
  amount?: number;
  eventDate?: string;
  venue?: string;
}

/**
 * Format mobile number with country code for MSG91 (e.g. 919876543210)
 */
export function formatMobileForMsg91(rawMobile: string, defaultCountryCode = '91'): string {
  const digitsOnly = String(rawMobile || '').replace(/\D/g, '');
  if (!digitsOnly) return '';

  if (digitsOnly.length === 10) {
    return `${defaultCountryCode}${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return `${defaultCountryCode}${digitsOnly.slice(1)}`;
  }
  return digitsOnly;
}

/**
 * Get base URL for public pass links
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '');
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  return 'https://ashabani.com';
}

/**
 * Low-level MSG91 Flow API dispatcher
 */
export async function sendMsg91FlowSms(params: {
  templateId?: string;
  mobile: string;
  variables: Record<string, string | number>;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = (
    params.templateId ||
    process.env.MSG91_DEFAULT_TEMPLATE_ID ||
    process.env.MSG91_FLOW_ID ||
    process.env.MSG91_TEMPLATE_ID ||
    ''
  ).trim();
  const senderId = (process.env.MSG91_SENDER_ID || '').trim();

  if (!authKey) {
    console.warn('[MSG91] MSG91_AUTH_KEY is not set in .env. Skipping SMS dispatch.');
    return { success: false, error: 'MSG91_AUTH_KEY is not configured in .env' };
  }

  if (!templateId || templateId.includes(',') || templateId.includes(' ') || templateId.startsWith('your_')) {
    console.warn(
      `[MSG91] Invalid or placeholder Template ID provided: "${templateId}". Please enter your valid MSG91 Flow/Template ID (e.g. 64c1234567890abcdef12345) in .env.`
    );
    return { success: false, error: `Invalid MSG91 Template ID: ${templateId}` };
  }

  const formattedMobile = formatMobileForMsg91(params.mobile);
  if (!formattedMobile) {
    console.warn('[MSG91] Invalid mobile number supplied:', params.mobile);
    return { success: false, error: 'Invalid recipient mobile number' };
  }

  const recipientPayload: Record<string, any> = {
    mobiles: formattedMobile,
    ...params.variables,
  };

  const payload: Record<string, any> = {
    template_id: templateId,
    short_url: '0',
    recipients: [recipientPayload],
  };

  if (senderId) {
    payload.sender = senderId;
  }

  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || (data && data.type === 'error')) {
      const errMsg = data?.message || `HTTP ${res.status}: ${res.statusText}`;
      console.error(`[MSG91 Error] Failed to send SMS to ${formattedMobile}:`, errMsg);
      return { success: false, error: errMsg, data };
    }

    console.log(`[MSG91 Success] SMS dispatched to ${formattedMobile} (Template ID: ${templateId})`, data);
    return { success: true, data };
  } catch (err: any) {
    console.error(`[MSG91 Network Error] Could not connect to MSG91 API:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Transactional Confirmation SMS for Customer Festival Ticket Pass
 */
export async function sendTicketBookingSms(params: TicketSmsParams) {
  const baseUrl = getBaseUrl();
  const bookingLink = `${baseUrl}/dandiyaraas/tickets/pass/${params.bookingId}`;
  const templateId =
    process.env.MSG91_TICKET_TEMPLATE_ID ||
    process.env.MSG91_TICKET_FLOW_ID ||
    process.env.MSG91_DEFAULT_TEMPLATE_ID ||
    process.env.MSG91_FLOW_ID ||
    process.env.MSG91_TEMPLATE_ID;

  const variables: Record<string, string | number> = {
    name: params.name,
    booking_id: params.bookingNumber,
    booking_link: bookingLink,
    pass_link: bookingLink,
    amount: params.amount ?? 0,
    voucher_amount: params.voucherBalance ?? 0,
    event_date: params.eventDate || '13 October 2026',
    venue: params.venue || 'Maharaja Agrasen Bhavan, Saharanpur',
    // Generic DLT positional aliases
    VAR1: params.name,
    VAR2: params.bookingNumber,
    VAR3: bookingLink,
    VAR4: params.amount ?? 0,
  };

  return await sendMsg91FlowSms({
    templateId,
    mobile: params.mobile,
    variables,
  });
}

/**
 * Send Transactional Confirmation SMS for Exhibitor Stall Booking
 */
export async function sendStallBookingSms(params: StallSmsParams) {
  const baseUrl = getBaseUrl();
  const bookingLink = `${baseUrl}/dandiyaraas/stall/pass/${params.bookingId}`;
  const templateId = process.env.MSG91_STALL_TEMPLATE_ID || process.env.MSG91_DEFAULT_TEMPLATE_ID;

  const displayName = params.brandName ? `${params.brandName} (${params.bookerName})` : params.bookerName;

  const variables: Record<string, string | number> = {
    name: params.bookerName,
    brand_name: params.brandName || params.bookerName,
    stall_number: params.stallNumber,
    booking_id: params.bookingNumber,
    booking_link: bookingLink,
    pass_link: bookingLink,
    amount: params.amount ?? 0,
    event_date: params.eventDate || '13 October 2026',
    venue: params.venue || 'Maharaja Agrasen Bhavan, Saharanpur',
    // Generic DLT positional aliases
    VAR1: displayName,
    VAR2: params.stallNumber,
    VAR3: params.bookingNumber,
    VAR4: bookingLink,
  };

  return await sendMsg91FlowSms({
    templateId,
    mobile: params.mobile,
    variables,
  });
}
