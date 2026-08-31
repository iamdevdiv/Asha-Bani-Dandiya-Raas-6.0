import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const requestedPath = pathSegments.join('/');

    // Check possible locations on disk
    const searchPaths = [
      path.join(process.cwd(), 'public', 'images', 'carousel', ...pathSegments),
      path.join(process.cwd(), 'public', 'images', ...pathSegments),
      path.join(process.cwd(), 'public', ...pathSegments),
    ];

    let targetFilePath = '';
    for (const p of searchPaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        targetFilePath = p;
        break;
      }
    }

    if (!targetFilePath) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ targetFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    console.error('Error serving uploaded media:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
