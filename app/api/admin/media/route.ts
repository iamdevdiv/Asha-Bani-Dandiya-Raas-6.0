import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { getCarouselImages, updateCarouselImages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const images = await getCarouselImages();
  return NextResponse.json({ success: true, images });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { images } = await req.json();
    if (!Array.isArray(images)) {
      return NextResponse.json({ success: false, message: 'Invalid images array' }, { status: 400 });
    }

    const updated = await updateCarouselImages(images);
    return NextResponse.json({ success: true, images: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update media.' },
      { status: 500 }
    );
  }
}
