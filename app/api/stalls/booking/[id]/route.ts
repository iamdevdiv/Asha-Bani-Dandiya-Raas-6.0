import { NextRequest, NextResponse } from 'next/server';
import { getBookingById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch booking details.' },
      { status: 500 }
    );
  }
}
