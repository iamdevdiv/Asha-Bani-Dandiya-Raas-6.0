import { NextResponse } from 'next/server';
import { getCarouselImages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await getCarouselImages();
    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
