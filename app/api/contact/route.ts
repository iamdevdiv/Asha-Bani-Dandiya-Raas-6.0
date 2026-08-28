import { NextResponse } from 'next/server';
import { createInquiry } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, preferredDate, preferredTime, message } = body;

    if (!name || !phone || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'All required fields (name, phone, email, message) must be provided.' },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry({
      name,
      phone,
      email,
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully. Our team will contact you shortly.',
      inquiry,
    });
  } catch (error: any) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
