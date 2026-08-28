import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getAdminSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req) || (await getAdminSession());
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const allFiles: File[] = [];
    if (singleFile && singleFile.size > 0) {
      allFiles.push(singleFile);
    }
    for (const f of files) {
      if (f && f.size > 0) {
        allFiles.push(f);
      }
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ success: false, message: 'No image file uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'carousel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      const originalExt = path.extname(file.name).toLowerCase() || '.jpg';
      if (!ALLOWED_EXTENSIONS.has(originalExt)) {
        return NextResponse.json(
          { success: false, message: `Unsupported file type: ${originalExt}. Allowed types: JPG, PNG, WEBP, AVIF` },
          { status: 400 }
        );
      }

      const cleanBase = path
        .basename(file.name, originalExt)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const filename = `slide_${Date.now()}_${cleanBase}${originalExt}`;
      const filePath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      uploadedUrls.push(`/api/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} file(s)`,
    });
  } catch (error: any) {
    console.error('Carousel image upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
