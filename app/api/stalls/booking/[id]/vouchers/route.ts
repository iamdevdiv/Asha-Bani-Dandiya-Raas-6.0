import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, getStallVoucherTransactionsWithSender } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Stall booking not found.' }, { status: 404 });
    }

    const data = await getStallVoucherTransactionsWithSender(booking.stallNumber);

    return NextResponse.json({
      success: true,
      stallNumber: booking.stallNumber,
      brandName: booking.brandName || booking.bookerName,
      totalEarned: data.totalEarned,
      transactionCount: data.transactionCount,
      transactions: data.transactions,
    });
  } catch (error: any) {
    console.error('Error fetching stall voucher transactions:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch voucher transactions.' },
      { status: 500 }
    );
  }
}
