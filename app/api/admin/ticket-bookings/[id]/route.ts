import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { deleteTicketBooking } from '@/lib/db';

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
      return NextResponse.json({ success: false, message: 'Ticket Booking ID is required' }, { status: 400 });
    }

    const success = await deleteTicketBooking(id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Ticket booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ticket pass booking deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ticket booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete ticket booking' }, { status: 500 });
  }
}
