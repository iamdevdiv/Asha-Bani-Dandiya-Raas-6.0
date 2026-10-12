import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import { deleteTicketBooking, updateTicketBooking } from '@/lib/db';

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const {
      fullName,
      mobile,
      childrenCount,
      childrenNames,
      phaseId,
      totalAmount,
      isComplimentary,
    } = body;

    if (fullName !== undefined && (!fullName || fullName.trim().length < 2)) {
      return NextResponse.json({ success: false, message: 'Attendee name must be at least 2 characters' }, { status: 400 });
    }

    if (mobile !== undefined) {
      const cleanMobile = mobile.replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        return NextResponse.json({ success: false, message: 'Valid 10-digit mobile number is required' }, { status: 400 });
      }
    }

    const updatedBooking = await updateTicketBooking(id, {
      fullName: fullName !== undefined ? fullName.trim() : undefined,
      mobile: mobile !== undefined ? mobile.replace(/\D/g, '') : undefined,
      childrenCount: childrenCount !== undefined ? Number(childrenCount) : undefined,
      childrenNames: Array.isArray(childrenNames) ? childrenNames.filter((n: string) => n && n.trim()) : undefined,
      phaseId: phaseId || undefined,
      totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
      isComplimentary: Boolean(isComplimentary),
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Ticket pass details updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating ticket booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update ticket booking' },
      { status: 500 }
    );
  }
}

