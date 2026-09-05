import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { getBookingById, updateBookingPayment, markStallBooked, getSettings } from '@/lib/db';
import { generateStallQrCode } from '@/lib/qr-service';
import { generateBookingConfirmationPackage } from '@/lib/docx-pdf-service';
import { sendStallBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, razorpayPaymentId, sendSms } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID is required.' }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Stall booking not found.' }, { status: 404 });
    }

    const paymentId = razorpayPaymentId && razorpayPaymentId.trim()
      ? razorpayPaymentId.trim()
      : booking.razorpayPaymentId || `ADMIN_CONFIRMED_${Date.now()}`;

    const settings = await getSettings();
    const eventDate = settings.event_date || '13 October 2026';
    const venue = `${settings.venue_name || 'Maharaja Agrasen Bhavan'}, ${settings.venue_address || 'Saharanpur'}`;

    // 1. Generate QR Code
    const qrCodeDataUrl = await generateStallQrCode({
      bookingNumber: booking.bookingNumber,
      stallNumber: booking.stallNumber,
      bookerName: booking.bookerName,
      brandName: booking.brandName,
      stallType: booking.stallType,
      eventDate,
      venue,
    });

    // 2. Generate 1080x1080 Pass Image and populate DOCX
    const docxPackage = await generateBookingConfirmationPackage({
      stallNumber: booking.stallNumber,
      bookerName: booking.bookerName,
      brandName: booking.brandName,
      bookingNumber: booking.bookingNumber,
      eventDate,
      venue,
      qrDataUrl: qrCodeDataUrl,
    });

    // 3. Mark stall as booked in database
    await markStallBooked(booking.stallNumber, {
      bookingId: booking.id,
      bookerName: booking.bookerName,
      brandName: booking.brandName,
      mobile: booking.mobile,
      email: booking.email,
    });

    // 4. Update booking payment record
    const updatedBooking = await updateBookingPayment(booking.id, {
      razorpayPaymentId: paymentId,
      razorpaySignature: booking.razorpaySignature || 'ADMIN_MANUALLY_VERIFIED',
      paymentStatus: 'success',
      qrCodeDataUrl,
      confirmationDocUrl: docxPackage.image1080DataUrl,
    });

    // 5. Fire stall booking SMS asynchronously or directly if requested
    let smsDispatched = false;
    let smsError: string | null = null;
    if (sendSms !== false && updatedBooking) {
      try {
        const smsRes = await sendStallBookingSms(updatedBooking);
        if (smsRes && smsRes.success) {
          smsDispatched = true;
        } else if (smsRes && smsRes.error) {
          smsError = smsRes.error;
        }
      } catch (smsErr: any) {
        console.error('[Admin Confirm] Stall SMS Dispatch Error:', smsErr);
        smsError = smsErr?.message || 'Failed to dispatch SMS';
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      qrCodeDataUrl,
      image1080DataUrl: docxPackage.image1080DataUrl,
      smsDispatched,
      smsError,
      message: `Stall #${booking.stallNumber} booking confirmed successfully! Pass package generated.${smsDispatched ? ' SMS sent to exhibitor.' : ''}`,
    });
  } catch (error: any) {
    console.error('[Admin Confirm] Error confirming stall booking payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to confirm stall booking payment.' },
      { status: 500 }
    );
  }
}
