import { NextResponse } from 'next/server';
import { getStalls } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawStalls = await getStalls();
    // Sanitize PII for public response: do not expose private phone numbers, emails, or personal names
    const stalls = rawStalls.map((s) => ({
      id: s.id,
      stallNumber: s.stallNumber,
      section: s.section,
      price: s.price,
      isBooked: s.isBooked,
      bookedByBrand: s.bookedByBrand || null,
    }));
    return NextResponse.json({ success: true, stalls });
  } catch (error: any) {
    console.error('API Error in GET /api/stalls:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stalls' },
      { status: 500 }
    );
  }
}
