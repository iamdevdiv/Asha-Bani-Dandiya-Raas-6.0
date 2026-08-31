import { NextRequest, NextResponse } from 'next/server';
import { getTicketPhases, saveTicketPhase, deleteTicketPhase, getCurrentActivePhase } from '@/lib/db';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch phases (public returns current active phase + all phases)
export async function GET(req: NextRequest) {
  try {
    const phases = await getTicketPhases();
    const currentActive = await getCurrentActivePhase();
    return NextResponse.json({
      success: true,
      phases,
      currentActive,
    });
  } catch (error: any) {
    console.error('Error fetching ticket phases:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Admin save / update phase
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.startDate || !body.endDate || !body.adultPrice) {
      return NextResponse.json({ success: false, message: 'Missing required phase fields' }, { status: 400 });
    }

    const saved = await saveTicketPhase(body);
    return NextResponse.json({ success: true, phase: saved, message: 'Ticket phase saved successfully' });
  } catch (error: any) {
    console.error('Error saving ticket phase:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Admin delete phase
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Phase ID is required' }, { status: 400 });
    }

    await deleteTicketPhase(id);
    return NextResponse.json({ success: true, message: 'Phase deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ticket phase:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
