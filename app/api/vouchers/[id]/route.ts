import { NextRequest, NextResponse } from 'next/server';
import { getVoucherWallet } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Wallet ID is required' }, { status: 400 });
    }

    const wallet = await getVoucherWallet(id);
    if (!wallet) {
      return NextResponse.json({ success: false, message: 'Voucher wallet not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch (error: any) {
    console.error('Error fetching voucher wallet:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
