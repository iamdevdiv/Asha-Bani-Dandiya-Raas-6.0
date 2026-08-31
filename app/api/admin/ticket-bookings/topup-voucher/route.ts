import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { topUpTicketVoucherBalance } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketBookingId, additionalAmount, reason } = body;

    if (!ticketBookingId) {
      return NextResponse.json({ success: false, message: 'Ticket Booking ID is required' }, { status: 400 });
    }

    const amount = Number(additionalAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Top-up amount must be greater than ₹0' }, { status: 400 });
    }

    const result = await topUpTicketVoucherBalance({
      ticketBookingId,
      additionalAmount: amount,
      reason: reason || undefined,
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      transaction: result.transaction,
      message: `Successfully topped up ₹${amount} to voucher balance!`,
    });
  } catch (error: any) {
    console.error('Error topping up voucher balance:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to top-up voucher' }, { status: 500 });
  }
}
