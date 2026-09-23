import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, getStallMembersByBookingId, getCurrentActivePhase } from '@/lib/db';

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

    const [additionalMembers, currentPhase] = await Promise.all([
      getStallMembersByBookingId(booking.id),
      getCurrentActivePhase(),
    ]);

    return NextResponse.json({
      success: true,
      booking,
      additionalMembers,
      currentPhase: currentPhase
        ? {
            id: currentPhase.id,
            name: currentPhase.name,
            adultPrice: currentPhase.adultPrice || 499,
            phaseNumber: currentPhase.phaseNumber || 1,
          }
        : {
            id: 'phase_1',
            name: 'Phase 1 - Early Bird',
            adultPrice: 499,
            phaseNumber: 1,
          },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch booking details.' },
      { status: 500 }
    );
  }
}

