import { NextRequest, NextResponse } from 'next/server';
import { updateTicketBookingVoucherRule } from '@/lib/db';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketBookingId, voucherApplicableTo } = body;

    if (!ticketBookingId) {
      return NextResponse.json({ success: false, message: 'Ticket Booking ID is required' }, { status: 400 });
    }

    const allowedRules = ['default', 'food', 'other', 'both'];
    if (!allowedRules.includes(voucherApplicableTo)) {
      return NextResponse.json({ success: false, message: 'Invalid voucher rule option' }, { status: 400 });
    }

    const result = await updateTicketBookingVoucherRule(ticketBookingId, voucherApplicableTo);

    return NextResponse.json({
      success: true,
      message: `Voucher access rule updated for booking.`,
      booking: result.booking,
    });
  } catch (error: any) {
    console.error('Error updating voucher rule:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
