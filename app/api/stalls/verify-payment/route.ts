import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, updateBookingPayment, markStallBooked, getSettings } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { generateStallQrCode } from '@/lib/qr-service';
import { generateBookingConfirmationPackage } from '@/lib/docx-pdf-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!bookingId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing payment confirmation parameters.' },
        { status: 400 }
      );
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking reference not found.' }, { status: 404 });
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId || booking.razorpayOrderId || '',
      paymentId: razorpayPaymentId,
      signature: razorpaySignature || '',
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Payment signature verification failed.' },
        { status: 400 }
      );
    }

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
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus: 'success',
      qrCodeDataUrl,
      confirmationDocUrl: docxPackage.image1080DataUrl,
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      qrCodeDataUrl,
      image1080DataUrl: docxPackage.image1080DataUrl,
      methodUsed: docxPackage.methodUsed,
    });
  } catch (error: any) {
    console.error('Error in POST /api/stalls/verify-payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification encountered an error.' },
      { status: 500 }
    );
  }
}
