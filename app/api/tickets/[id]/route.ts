import { NextRequest, NextResponse } from 'next/server';
import { getTicketBookingById, getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Ticket ID is required' }, { status: 400 });
    }

    const booking = await getTicketBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Ticket pass not found' }, { status: 404 });
    }

    const settings = await getSettings();

    // Parse children names if stored as JSON string
    let parsedChildren: string[] = [];
    if (booking.childrenNames) {
      try {
        parsedChildren = typeof booking.childrenNames === 'string' ? JSON.parse(booking.childrenNames) : booking.childrenNames;
      } catch {
        parsedChildren = [];
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        childrenNamesList: parsedChildren,
      },
      settings: {
        event_name: settings.event_name || 'Asha Bani Dandiya Raas 6.0',
        event_date: settings.event_date || '13 October 2026',
        event_time: settings.event_time || '6:00 PM to 12:00 AM',
        venue_name: settings.venue_name || 'Maharaja Agrasen Bhavan',
        venue_address: settings.venue_address || 'Aggarwal Dharamshala, Saharanpur',
        contact_phone: settings.contact_phone || '+91 6399063455',
      },
    });
  } catch (error: any) {
    console.error('Error fetching ticket booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
