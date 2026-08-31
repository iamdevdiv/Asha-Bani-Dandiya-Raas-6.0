import { NextRequest, NextResponse } from 'next/server';
import { getStallVoucherEarnings, getVoucherTransactions } from '@/lib/db';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const stallEarnings = await getStallVoucherEarnings();
    const transactions = await getVoucherTransactions({});

    const totalRedeemed = transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return NextResponse.json({
      success: true,
      stallEarnings,
      transactions,
      totalRedeemed,
    });
  } catch (error: any) {
    console.error('Error fetching admin stall vouchers:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
