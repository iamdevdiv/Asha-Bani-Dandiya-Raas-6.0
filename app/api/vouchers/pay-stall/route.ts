import { NextRequest, NextResponse } from 'next/server';
import { redeemStallVoucher } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletId, walletType, stallNumber, amount } = body;

    if (!walletId || !walletType || !stallNumber || !amount) {
      return NextResponse.json({ success: false, message: 'Missing required payment parameters' }, { status: 400 });
    }

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Please enter a valid amount greater than ₹0' }, { status: 400 });
    }

    const result = await redeemStallVoucher({
      walletId,
      walletType: walletType === 'ambassador' ? 'ambassador' : 'ticket',
      stallNumber,
      amount: numAmount,
    });

    return NextResponse.json({
      success: true,
      balance: result.balance,
      transaction: result.transaction,
      message: `Successfully paid ₹${numAmount} to Stall ${stallNumber.toUpperCase()}`,
    });
  } catch (error: any) {
    console.error('Error processing voucher payment:', error);
    return NextResponse.json({ success: false, message: error.message || 'Payment failed' }, { status: 400 });
  }
}
