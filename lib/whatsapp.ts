/**
 * WhatsApp message text sanitation helper.
 * Strips invisible Unicode variation selectors, byte order marks,
 * and problematic multi-byte sequences that cause '?' / diamond glyph corruption in WhatsApp.
 */
export function sanitizeWhatsAppText(raw: string): string {
  return raw
    // Remove Unicode Replacement Character
    .replace(/\uFFFD/g, '')
    // Remove Variation Selectors (FE00 - FE0F) which cause '?' diamond on WhatsApp Web/Mobile
    .replace(/[\uFE00-\uFE0F]/g, '')
    // Remove zero-width characters (ZWNJ, ZWJ, ZWSP)
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    // Replace Rupee sign with Rs.
    .replace(/₹/g, 'Rs. ')
    // Replace en-dash and em-dash with standard hyphen
    .replace(/[\u2013\u2014]/g, '-')
    // Replace Unicode bullets with standard hyphen
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    // Replace smart quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace non-breaking spaces with standard space
    .replace(/\u00A0/g, ' ')
    .trim();
}

export function openWhatsAppChat(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const sanitized = sanitizeWhatsAppText(message);
  const url = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(sanitized)}`
    : `https://wa.me/?text=${encodeURIComponent(sanitized)}`;

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
