import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { deleteStallBooking } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const success = await deleteStallBooking(id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Stall booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Stall booking deleted and stall freed successfully' });
  } catch (error: any) {
    console.error('Error deleting stall booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete booking' }, { status: 500 });
  }
}
