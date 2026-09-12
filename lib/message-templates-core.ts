/**
 * Message Templates Core Types & Definitions for Asha Bani Dandiya Raas 2026.
 * Safe for both Client and Server execution (no direct DB or Node filesystem imports).
 */

export interface MessageTemplateDef {
  key: string;
  title: string;
  category: 'sms' | 'whatsapp';
  channel: 'SMS' | 'WhatsApp';
  description: string;
  defaultText: string;
  availableTokens: Array<{ token: string; label: string; example: string }>;
  samplePreviewData: Record<string, string | number>;
}

export const DEFAULT_TEMPLATES: Record<string, MessageTemplateDef> = {
  template_ticket_sms: {
    key: 'template_ticket_sms',
    title: 'Customer Ticket Booking Confirmation SMS',
    category: 'sms',
    channel: 'SMS',
    description: 'Dispatched automatically via TextBee when a customer purchases an entry pass online or is issued a pass.',
    defaultText:
      `Namaste {{name}}!\n\n` +
      `Your official entry pass for Asha Bani Dandiya Raas 6.0 is confirmed.\n\n` +
      `Booking ID: {{booking_id}}\n` +
      `{{price_line}}` +
      `Passes: {{passes_text}}\n` +
      `{{voucher_line}}` +
      `Date: {{event_date}}\n` +
      `Venue: {{venue}}\n\n` +
      `View / Download Your Digital Pass:\n{{pass_link}}`,
    availableTokens: [
      { token: '{{name}}', label: 'Customer Full Name', example: 'Pooja Bajaj' },
      { token: '{{booking_id}}', label: 'Booking Number', example: 'TK-2026-5821' },
      { token: '{{passes_text}}', label: 'Passes Count', example: '1 Adult + 1 Children' },
      { token: '{{price_line}}', label: 'Amount Paid Line', example: 'Amount Paid: Rs. 499\n' },
      { token: '{{voucher_line}}', label: 'Voucher Status Line', example: 'Included Voucher: Rs. 100\n' },
      { token: '{{voucher_amount}}', label: 'Voucher Amount Only', example: '100' },
      { token: '{{voucher_usability}}', label: 'Voucher Usability Text', example: 'Valid at All 35 Stalls' },
      { token: '{{event_date}}', label: 'Event Date', example: '13 October 2026 (6:00 PM onwards)' },
      { token: '{{venue}}', label: 'Venue Address', example: 'Maharaja Agrasen Bhavan, Saharanpur' },
      { token: '{{pass_link}}', label: 'Digital Pass URL', example: 'https://ashabani.com/dandiyaraas/tickets/pass/pass_123' },
    ],
    samplePreviewData: {
      name: 'Pooja Bajaj',
      booking_id: 'TK-2026-5821',
      passes_text: '1 Adult + 1 Children',
      price_line: 'Amount Paid: Rs. 499\n',
      voucher_line: 'Included Voucher: Rs. 100\n',
      voucher_amount: '100',
      voucher_usability: 'Valid at All 35 Stalls',
      event_date: '13 October 2026 (6:00 PM onwards)',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
      pass_link: 'https://ashabani.com/dandiyaraas/tickets/pass/sample_tk',
    },
  },

  template_stall_sms: {
    key: 'template_stall_sms',
    title: 'Exhibitor Stall Allotment Confirmation SMS',
    category: 'sms',
    channel: 'SMS',
    description: 'Dispatched automatically via TextBee when a stall exhibitor finishes payment and reserves a stall.',
    defaultText:
      `Namaste {{name}}!\n\n` +
      `Your stall booking for Asha Bani Dandiya Raas 6.0 is confirmed.\n\n` +
      `Booking ID: {{booking_id}}\n` +
      `Stall Number: {{stall_number}} ({{stall_section}})\n` +
      `Amount Paid: Rs. {{price}}\n` +
      `Date: {{event_date}}\n` +
      `Venue: {{venue}}\n\n` +
      `Download Your Exhibitor Pass:\n{{pass_link}}`,
    availableTokens: [
      { token: '{{name}}', label: 'Exhibitor Name', example: 'Ankit Sharma' },
      { token: '{{brand_name}}', label: 'Brand Name', example: 'Gujarati Zaika' },
      { token: '{{booking_id}}', label: 'Booking Number', example: 'STALL-2026-004' },
      { token: '{{stall_number}}', label: 'Stall Number', example: 'Stall 4' },
      { token: '{{stall_section}}', label: 'Stall Category/Section', example: 'Food Stall' },
      { token: '{{price}}', label: 'Stall Rent Paid', example: '5000' },
      { token: '{{event_date}}', label: 'Event Date', example: '13 October 2026' },
      { token: '{{venue}}', label: 'Venue Address', example: 'Maharaja Agrasen Bhavan, Saharanpur' },
      { token: '{{pass_link}}', label: 'Pass Access URL', example: 'https://ashabani.com/dandiyaraas/stall/success?bookingId=sample' },
    ],
    samplePreviewData: {
      name: 'Ankit Sharma',
      brand_name: 'Gujarati Zaika',
      booking_id: 'STALL-2026-004',
      stall_number: 'Stall 4',
      stall_section: 'Food Stall',
      price: '5000',
      event_date: '13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
      pass_link: 'https://ashabani.com/dandiyaraas/stall/success?bookingId=sample',
    },
  },

  template_ambassador_unified_sms: {
    key: 'template_ambassador_unified_sms',
    title: 'Ambassador Milestone Unlocked SMS (Unified)',
    category: 'sms',
    channel: 'SMS',
    description: 'Dispatched automatically when an ambassador hits a reward tier milestone, used when "Unified Message" is enabled.',
    defaultText:
      `Namaste {{ambassador_name}}!\n\n` +
      `Congratulations! You have achieved {{tier_name}} with {{referral_count}} referrals for Asha Bani Dandiya Raas 6.0!\n\n` +
      `{{reward_lines}}` +
      `Track your live milestone rewards on your dashboard:\n{{dashboard_url}}`,
    availableTokens: [
      { token: '{{ambassador_name}}', label: 'Ambassador Full Name', example: 'Rahul Sharma' },
      { token: '{{tier_name}}', label: 'Tier Name', example: 'Tier 1 - Silver Ambassador' },
      { token: '{{tier_level}}', label: 'Tier Level Number', example: '1' },
      { token: '{{referral_count}}', label: 'Referrals Count', example: '10' },
      { token: '{{reward_lines}}', label: 'Reward Lines (Passes + Voucher details)', example: 'Complimentary Entry Pass: TK-FREE-8821\nIncluded Stall Voucher: Rs. 500\nDownload Pass: https://...\n\n' },
      { token: '{{booking_number}}', label: 'Generated Free Pass Number (if any)', example: 'TK-FREE-8821' },
      { token: '{{pass_link}}', label: 'Generated Free Pass URL (if any)', example: 'https://ashabani.com/dandiyaraas/tickets/pass/sample' },
      { token: '{{dashboard_url}}', label: 'Ambassador Dashboard URL', example: 'https://ashabani.com/ambassador/dashboard' },
    ],
    samplePreviewData: {
      ambassador_name: 'Rahul Sharma',
      tier_name: 'Tier 1 - Silver Ambassador',
      tier_level: '1',
      referral_count: '10',
      voucher_amount: '500',
      reward_lines: 'Complimentary Entry Pass: TK-FREE-8821\nIncluded Stall Voucher: Rs. 500\nDownload Your Digital Pass:\nhttps://ashabani.com/dandiyaraas/tickets/pass/sample_free\n\n',
      booking_number: 'TK-FREE-8821',
      pass_link: 'https://ashabani.com/dandiyaraas/tickets/pass/sample_free',
      dashboard_url: 'https://ashabani.com/ambassador/dashboard',
    },
  },

  template_ambassador_tier_1_sms: {
    key: 'template_ambassador_tier_1_sms',
    title: 'Tier 1 (Silver) Milestone SMS',
    category: 'sms',
    channel: 'SMS',
    description: 'Specific milestone notification sent upon reaching Tier 1 (Silver Ambassador - 10 referrals).',
    defaultText:
      `Namaste {{ambassador_name}}! 🎉\n\n` +
      `Congratulations! You have officially unlocked {{tier_name}} with {{referral_count}} successful referrals for Asha Bani Dandiya Raas 6.0!\n\n` +
      `{{reward_lines}}` +
      `Keep going for Tier 2 Gold rewards:\n{{dashboard_url}}`,
    availableTokens: [
      { token: '{{ambassador_name}}', label: 'Ambassador Name', example: 'Rahul Sharma' },
      { token: '{{tier_name}}', label: 'Tier Name', example: 'Tier 1 - Silver Ambassador' },
      { token: '{{referral_count}}', label: 'Referrals Reached', example: '10' },
      { token: '{{reward_lines}}', label: 'Auto-formatted Pass & Voucher Details', example: 'Complimentary Entry Pass: TK-FREE-8821\nIncluded Voucher: Rs. 500\nDownload Pass: https://...\n\n' },
      { token: '{{dashboard_url}}', label: 'Ambassador Dashboard URL', example: 'https://ashabani.com/ambassador/dashboard' },
    ],
    samplePreviewData: {
      ambassador_name: 'Rahul Sharma',
      tier_name: 'Tier 1 - Silver Ambassador',
      referral_count: '10',
      reward_lines: 'Complimentary Entry Pass: TK-FREE-8821\nIncluded Stall Voucher: Rs. 500\nDownload Your Digital Pass:\nhttps://ashabani.com/dandiyaraas/tickets/pass/sample_free\n\n',
      dashboard_url: 'https://ashabani.com/ambassador/dashboard',
    },
  },

  template_ambassador_tier_2_sms: {
    key: 'template_ambassador_tier_2_sms',
    title: 'Tier 2 (Gold) Milestone SMS',
    category: 'sms',
    channel: 'SMS',
    description: 'Specific milestone notification sent upon reaching Tier 2 (Gold Ambassador - 25 referrals).',
    defaultText:
      `Namaste {{ambassador_name}}! 🌟\n\n` +
      `Incredible achievement! You have achieved {{tier_name}} with {{referral_count}} referrals for Asha Bani Dandiya Raas 6.0!\n\n` +
      `{{reward_lines}}` +
      `Track your live milestone settlements:\n{{dashboard_url}}`,
    availableTokens: [
      { token: '{{ambassador_name}}', label: 'Ambassador Name', example: 'Rahul Sharma' },
      { token: '{{tier_name}}', label: 'Tier Name', example: 'Tier 2 - Gold Ambassador' },
      { token: '{{referral_count}}', label: 'Referrals Reached', example: '25' },
      { token: '{{reward_lines}}', label: 'Auto-formatted Pass & Voucher Details', example: 'Milestone Stall Voucher: Rs. 1000\n\n' },
      { token: '{{dashboard_url}}', label: 'Ambassador Dashboard URL', example: 'https://ashabani.com/ambassador/dashboard' },
    ],
    samplePreviewData: {
      ambassador_name: 'Rahul Sharma',
      tier_name: 'Tier 2 - Gold Ambassador',
      referral_count: '25',
      reward_lines: 'Milestone Stall Voucher: Rs. 1000 Credited\n\n',
      dashboard_url: 'https://ashabani.com/ambassador/dashboard',
    },
  },

  template_ambassador_share_wa: {
    key: 'template_ambassador_share_wa',
    title: 'Ambassador WhatsApp Share to Potential Customers',
    category: 'whatsapp',
    channel: 'WhatsApp',
    description: 'The viral invite template that campus ambassadors copy & share to friends and groups on WhatsApp. Dynamically reflects active phase voucher amount and stall usability.',
    defaultText:
      `*JOIN US AT ASHA BANI DANDIYA RAAS 6.0!*\n\n` +
      `Enjoy a grand festive night of energetic Garba, live orchestra, and delicious Gujarati food stalls on *{{event_date}}* at {{venue}}!\n\n` +
      `*Book Official Passes Here:*\n{{referral_url}}\n\n` +
      `*Special Included Perk:* Every pass includes a *Rs. {{voucher_amount}} Free Stall Voucher* ({{voucher_usability}})!`,
    availableTokens: [
      { token: '{{referral_url}}', label: 'Unique Tracking Link', example: 'https://ashabani.com/dandiyaraas?ref=AMB_RAHU123' },
      { token: '{{voucher_amount}}', label: 'Active Phase Voucher Amount', example: '100' },
      { token: '{{voucher_usability}}', label: 'Active Phase Usability Description', example: 'Valid across all 35 Food & Commercial Stalls' },
      { token: '{{phase_name}}', label: 'Current Phase Name', example: 'Phase 1 - Early Bird' },
      { token: '{{adult_price}}', label: 'Current Adult Price', example: '499' },
      { token: '{{event_date}}', label: 'Event Date', example: '13 October 2026' },
      { token: '{{venue}}', label: 'Event Venue', example: 'Maharaja Agrasen Bhavan, Saharanpur' },
      { token: '{{ambassador_name}}', label: 'Ambassador Full Name', example: 'Rahul Sharma' },
    ],
    samplePreviewData: {
      referral_url: 'https://ashabani.com/dandiyaraas?ref=AMB_RAHU123',
      voucher_amount: '100',
      voucher_usability: 'Valid across all 35 Food & Commercial Stalls',
      phase_name: 'Phase 1 - Early Bird',
      adult_price: '499',
      event_date: '13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
      ambassador_name: 'Rahul Sharma',
    },
  },

  template_stall_wa: {
    key: 'template_stall_wa',
    title: 'Exhibitor WhatsApp Allotment Card',
    category: 'whatsapp',
    channel: 'WhatsApp',
    description: 'Direct WhatsApp message sent by Admin directly to the stall owner from the Stall Bookings dashboard.',
    defaultText:
      `*NAMASTE {{brand_or_name}}!*\n\n` +
      `Thank you for being an integral part of Asha Bani Dandiya Raas 6.0.\n\n` +
      `Your stall reservation has been confirmed as an official stall exhibitor:\n` +
      `- *Stall:* Stall {{stall_number}}\n` +
      `- *Booking ID:* {{booking_id}}\n` +
      `- *Date:* {{event_date}}\n` +
      `- *Venue:* {{venue}}\n` +
      `- *Stall Setup Time:* {{setup_time}}\n` +
      `- *Event Hours:* {{event_hours}}\n` +
      `- *Passes Included:* 2 Official Exhibitor Passes ({{team_members}})\n\n` +
      `*Official Digital Pass Link:*\n{{pass_link}}\n\n` +
      `Please show this pass at the gate for scanning and entry into the venue.\n\n` +
      `*Helpline:* {{helpline}}`,
    availableTokens: [
      { token: '{{brand_or_name}}', label: 'Uppercase Brand / Booker Name', example: 'GUJARATI ZAIKA' },
      { token: '{{name}}', label: 'Booker Name', example: 'Ankit Sharma' },
      { token: '{{brand_name}}', label: 'Stall Brand Name', example: 'Gujarati Zaika' },
      { token: '{{stall_number}}', label: 'Stall Number', example: '4' },
      { token: '{{booking_id}}', label: 'Booking Reference Number', example: 'STALL-2026-004' },
      { token: '{{event_date}}', label: 'Event Date & Day', example: 'Tuesday, 13 October 2026' },
      { token: '{{venue}}', label: 'Venue Address', example: 'Maharaja Agrasen Bhavan, Saharanpur' },
      { token: '{{setup_time}}', label: 'Stall Setup Time', example: '4:00 PM' },
      { token: '{{event_hours}}', label: 'Event Hours', example: '6:00 PM to 12:00 AM' },
      { token: '{{team_members}}', label: 'Designated Team Names', example: 'Ankit Sharma, Priya Sharma' },
      { token: '{{pass_link}}', label: 'Digital Exhibitor Pass Link', example: 'https://ashabani.com/dandiyaraas/stall/success?bookingId=sample' },
      { token: '{{helpline}}', label: 'Organizer Helpline Number', example: '+91 6399063455' },
    ],
    samplePreviewData: {
      brand_or_name: 'GUJARATI ZAIKA',
      name: 'Ankit Sharma',
      brand_name: 'Gujarati Zaika',
      stall_number: '4',
      booking_id: 'STALL-2026-004',
      event_date: 'Tuesday, 13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
      setup_time: '4:00 PM',
      event_hours: '6:00 PM to 12:00 AM',
      team_members: 'Ankit Sharma, Priya Sharma',
      pass_link: 'https://ashabani.com/dandiyaraas/stall/success?bookingId=sample',
      helpline: '+91 6399063455',
    },
  },

  template_ticket_wa: {
    key: 'template_ticket_wa',
    title: 'Customer Ticket WhatsApp Pass Card',
    category: 'whatsapp',
    channel: 'WhatsApp',
    description: 'Direct WhatsApp message sent by Admin to attendee from Ticket Bookings dashboard.',
    defaultText:
      `*NAMASTE {{name}}!*\n\n` +
      `Your entry pass for Asha Bani Dandiya Raas 6.0 is confirmed and ready:\n\n` +
      `- *Booking ID:* {{booking_id}}\n` +
      `- *Passes:* {{passes_text}}\n` +
      `- *Free Stall Voucher:* Rs. {{voucher_amount}} ({{voucher_usability}})\n` +
      `- *Event Date:* {{event_date}}\n` +
      `- *Venue:* {{venue}}\n\n` +
      `*Download Your Official Digital Pass:*\n{{pass_link}}\n\n` +
      `Please show your pass QR code at the entry gate. Looking forward to celebrating with you!\n\n` +
      `*Helpline:* {{helpline}}`,
    availableTokens: [
      { token: '{{name}}', label: 'Customer Name', example: 'Pooja Bajaj' },
      { token: '{{booking_id}}', label: 'Booking ID', example: 'TK-2026-5821' },
      { token: '{{passes_text}}', label: 'Passes Count', example: '1 Adult + 1 Children' },
      { token: '{{voucher_amount}}', label: 'Voucher Amount', example: '100' },
      { token: '{{voucher_usability}}', label: 'Voucher Usability', example: 'Valid across all 35 Stalls' },
      { token: '{{event_date}}', label: 'Event Date', example: '13 October 2026' },
      { token: '{{venue}}', label: 'Venue Address', example: 'Maharaja Agrasen Bhavan, Saharanpur' },
      { token: '{{pass_link}}', label: 'Pass URL', example: 'https://ashabani.com/dandiyaraas/tickets/pass/sample_tk' },
      { token: '{{helpline}}', label: 'Helpline Number', example: '+91 6399063455' },
    ],
    samplePreviewData: {
      name: 'Pooja Bajaj',
      booking_id: 'TK-2026-5821',
      passes_text: '1 Adult + 1 Children',
      voucher_amount: '100',
      voucher_usability: 'Valid across all 35 Stalls',
      event_date: 'Tuesday, 13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
      pass_link: 'https://ashabani.com/dandiyaraas/tickets/pass/sample_tk',
      helpline: '+91 6399063455',
    },
  },

  template_ambassador_onboarding_wa: {
    key: 'template_ambassador_onboarding_wa',
    title: 'Ambassador Onboarding & Credentials (WhatsApp)',
    category: 'whatsapp',
    channel: 'WhatsApp',
    description: 'Congratulatory welcome and onboarding message sent by Admin to active campus ambassadors containing their login link, credentials, and referral link.',
    defaultText:
      `*CONGRATULATIONS {{name}}!* 🎉\n\n` +
      `Welcome to the official Campus Ambassador team for *Asha Bani Dandiya Raas 6.0*!\n\n` +
      `Here are your Ambassador Portal login credentials:\n` +
      `- *Login Link:* {{login_url}}\n` +
      `- *Registered Mobile:* {{mobile}}\n` +
      `- *Password:* {{password}}\n\n` +
      `*Your Unique Referral Link to Share:*\n` +
      `{{referral_url}}\n\n` +
      `Share this link with your friends, family, and college groups! Every pass booked through your link earns you milestone rewards, free entry passes, and food stall vouchers.\n\n` +
      `Track your live referrals anytime on your dashboard:\n` +
      `{{login_url}}\n\n` +
      `We are thrilled to have you lead the festivities! 🌟`,
    availableTokens: [
      { token: '{{name}}', label: 'Ambassador Full Name', example: 'Rahul Sharma' },
      { token: '{{mobile}}', label: 'Registered Mobile Number', example: '9876543210' },
      { token: '{{password}}', label: 'Login Password', example: 'AshaBani@2026' },
      { token: '{{login_url}}', label: 'Ambassador Login Link', example: 'https://ashabani.com/ambassador/login' },
      { token: '{{ref_code}}', label: 'Unique Referral Code', example: 'AMB_RAHU123' },
      { token: '{{referral_url}}', label: 'Referral Link to Share', example: 'https://ashabani.com/dandiyaraas?ref=AMB_RAHU123' },
      { token: '{{event_date}}', label: 'Event Date', example: '13 October 2026' },
      { token: '{{venue}}', label: 'Event Venue', example: 'Maharaja Agrasen Bhavan, Saharanpur' },
    ],
    samplePreviewData: {
      name: 'Rahul Sharma',
      mobile: '9876543210',
      password: 'AshaBani@2026',
      login_url: 'https://ashabani.com/ambassador/login',
      ref_code: 'AMB_RAHU123',
      referral_url: 'https://ashabani.com/dandiyaraas?ref=AMB_RAHU123',
      event_date: '13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
    },
  },
};

/**
 * Returns human-friendly usability string for stall vouchers based on applicability rule.
 */
export function getVoucherUsabilityLabel(applicableTo?: string | null): string {
  if (applicableTo === 'food') return 'Food Stalls Only (Stalls 1-15)';
  if (applicableTo === 'other') return 'Commercial & Shopping Stalls (Stalls A-T)';
  return 'Valid across all 35 Food & Commercial Stalls';
}

/**
 * Safely replaces all {{tokens}} with provided variables.
 * Leaves unmapped tokens intact or replaces with empty string.
 */
export function renderMessageTemplate(template: string, variables: Record<string, any>): string {
  if (!template) return '';

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, token) => {
    if (variables[token] !== undefined && variables[token] !== null) {
      return String(variables[token]);
    }
    return match;
  });
}
