import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { getBookingById, updateAdminStallBooking, deleteStallBooking, getStallMembersByBookingId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const additionalMembers = await getStallMembersByBookingId(booking.id);

    return NextResponse.json({
      success: true,
      booking,
      additionalMembers,
      passUrl: booking.qrCodeDataUrl ? `/dandiyaraas/stall/pass/${booking.id}` : null,
      bookingLink: `/dandiyaraas/stall/success?bookingId=${booking.id}`,
    });
  } catch (error: any) {
    console.error('Error fetching stall booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const updatedBooking = await updateAdminStallBooking(id, body);

    const passUrl = updatedBooking.qrCodeDataUrl ? `/dandiyaraas/stall/pass/${updatedBooking.id}` : null;
    const bookingLink = `/dandiyaraas/stall/success?bookingId=${updatedBooking.id}`;

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      passUrl,
      bookingLink,
      message: `Stall #${updatedBooking.stallNumber} details saved successfully.${
        passUrl ? ' Digital pass link is active.' : ''
      }`,
    });
  } catch (error: any) {
    console.error('Error updating stall booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
