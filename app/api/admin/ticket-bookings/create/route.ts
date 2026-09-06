import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { createAdminIssuedTicketBooking } from '@/lib/db';
import { sendTicketBookingSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      mobile,
      email,
      address,
      adultCount,
      childrenCount,
      childrenNames,
      phaseId,
      totalAmount,
      voucherAmount,
      voucherApplicableTo,
      referredByAmbassadorId,
      paymentMethod,
      sendSms,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
    }

    const cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit mobile number is required.' }, { status: 400 });
    }

    const booking = await createAdminIssuedTicketBooking({
      fullName: fullName.trim(),
      mobile: cleanMobile,
      email: email?.trim() || undefined,
      address: address?.trim() || 'Saharanpur',
      adultCount: adultCount !== undefined ? Number(adultCount) : 1,
      childrenCount: childrenCount !== undefined ? Number(childrenCount) : (Array.isArray(childrenNames) ? childrenNames.length : 0),
      childrenNames: Array.isArray(childrenNames) ? childrenNames.filter((n: string) => n && n.trim()) : [],
      phaseId: phaseId || undefined,
      totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
      voucherAmount: voucherAmount !== undefined ? Number(voucherAmount) : undefined,
      voucherApplicableTo: voucherApplicableTo || 'both',
      referredByAmbassadorId: referredByAmbassadorId || undefined,
      paymentMethod: paymentMethod || undefined,
    });

    let smsDispatched = false;
    let smsError: string | null = null;

    if (sendSms !== false) {
      try {
        const smsRes = await sendTicketBookingSms(booking);
        if (smsRes && smsRes.success) {
          smsDispatched = true;
        } else if (smsRes && smsRes.error) {
          smsError = smsRes.error;
        }
      } catch (err: any) {
        console.error('[Admin Ticket Creation] SMS Dispatch Error:', err);
        smsError = err?.message || 'Failed to dispatch SMS';
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      passUrl: `/dandiyaraas/tickets/pass/${booking.id}`,
      smsDispatched,
      smsError,
      message: `Pass #${booking.bookingNumber} issued successfully for ${booking.fullName}!${smsDispatched ? ' SMS sent to attendee.' : ''}`,
    });
  } catch (error: any) {
    console.error('Error creating admin ticket booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate ticket pass.' },
      { status: 500 }
    );
  }
}
