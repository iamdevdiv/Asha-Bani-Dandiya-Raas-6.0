import { NextRequest, NextResponse } from 'next/server';
import { getInquiries, updateInquiryStatus, deleteInquiry } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID and status are required' },
        { status: 400 }
      );
    }

    const updated = await updateInquiryStatus(id, status);
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Inquiry ID is required' }, { status: 400 });
    }

    await deleteInquiry(id);
    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
