import QRCode from 'qrcode';

export interface QrPassData {
  bookingNumber: string;
  stallNumber: string;
  bookerName: string;
  brandName: string;
  stallType: string;
  eventDate: string;
  venue: string;
}

export async function generateStallQrCode(data: QrPassData): Promise<string> {
  const qrPayload = JSON.stringify({
    event: 'Asha Bani Dandiya Raas 6.0 (2026)',
    bookingNo: data.bookingNumber,
    stall: data.stallNumber,
    brand: data.brandName,
    booker: data.bookerName,
    date: data.eventDate,
    venue: 'Maharaja Agrasen Bhavan, Saharanpur',
    verificationUrl: `https://ashabani.com/verify-pass?ref=${encodeURIComponent(data.bookingNumber)}`,
  });

  return await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 400,
    color: {
      dark: '#450a0a', // Deep royal crimson
      light: '#ffffff',
    },
  });
}
