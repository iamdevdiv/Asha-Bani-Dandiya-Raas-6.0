import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { createAdminIssuedStallBooking } from '@/lib/db';
import { sendStallBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      stallNumber,
      bookerName,
      brandName,
      mobile,
      email,
      stallType,
      amount,
      paymentStatus,
      paymentMethod,
      teamMembers,
      generateBookingLink,
      sendSms,
    } = body;

    if (!stallNumber || !stallNumber.trim()) {
      return NextResponse.json({ success: false, message: 'Please select or provide a stall number.' }, { status: 400 });
    }

    if (!bookerName || !bookerName.trim()) {
      return NextResponse.json({ success: false, message: 'Booker full name is required.' }, { status: 400 });
    }

    if (!brandName || !brandName.trim()) {
      return NextResponse.json({ success: false, message: 'Brand or business name is required.' }, { status: 400 });
    }

    const cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit mobile number is required.' }, { status: 400 });
    }

    if (Boolean(generateBookingLink) && paymentStatus && paymentStatus !== 'success') {
      return NextResponse.json({
        success: false,
        message: 'Cannot generate booking link or pass for pending payments. Please confirm payment first or disable link generation.',
      }, { status: 400 });
    }

    const booking = await createAdminIssuedStallBooking({
      stallNumber: stallNumber.trim(),
      bookerName: bookerName.trim(),
      brandName: brandName.trim(),
      mobile: cleanMobile,
      email: email?.trim(),
      stallType: stallType?.trim(),
      amount: amount !== undefined ? Number(amount) : undefined,
      paymentStatus: paymentStatus || 'success',
      paymentMethod: paymentMethod || 'Manual',
      teamMembers,
      generateBookingLink: Boolean(generateBookingLink),
    });

    let smsDispatched = false;
    let smsError: string | null = null;

    if (sendSms && Boolean(generateBookingLink)) {
      try {
        const smsRes = await sendStallBookingSms(booking);
        if (smsRes && smsRes.success) {
          smsDispatched = true;
        } else if (smsRes && smsRes.error) {
          smsError = smsRes.error;
        }
      } catch (smsErr: any) {
        console.error('[Admin Stall Create] SMS Dispatch Error:', smsErr);
        smsError = smsErr?.message || 'Failed to dispatch SMS';
      }
    }

    const passUrl = booking.qrCodeDataUrl ? `/dandiyaraas/stall/pass/${booking.id}` : null;
    const bookingLink = `/dandiyaraas/stall/success?bookingId=${booking.id}`;

    return NextResponse.json({
      success: true,
      booking,
      passUrl,
      bookingLink,
      smsDispatched,
      smsError,
      message: `Stall #${booking.stallNumber} reserved successfully for ${booking.brandName}!${
        passUrl ? ' Digital pass link & QR generated.' : ' (Offline reservation - digital pass link not generated).'
      }`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/bookings/create:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to issue stall booking.' },
      { status: 500 }
    );
  }
}
