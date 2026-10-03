import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import {
  getStalls,
  getStallByNumber,
  updateStall,
  updateStallCategoryPrices,
  createAdminIssuedStallBooking,
  updateAdminStallBooking,
  deleteStallBooking,
  generateStallBookingLinkAndPass,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const stalls = await getStalls();
  return NextResponse.json({ success: true, stalls });
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check for bulk category & badge pricing update
    if (body.action === 'update_category_pricing' || body.categoryPrices) {
      const prices = body.categoryPrices || body;
      const updatedStalls = await updateStallCategoryPrices({
        foodPrice: prices.foodPrice !== undefined ? Number(prices.foodPrice) : undefined,
        cjPrice: prices.cjPrice !== undefined ? Number(prices.cjPrice) : undefined,
        turningPrice: prices.turningPrice !== undefined ? Number(prices.turningPrice) : undefined,
        frontPrice: prices.frontPrice !== undefined ? Number(prices.frontPrice) : undefined,
      });
      return NextResponse.json({ success: true, stalls: updatedStalls });
    }

    const {
      stallNumber,
      price,
      isBooked,
      bookedByName,
      bookedByBrand,
      bookedByMobile,
      bookedByEmail,
      teamMembers,
      generateBookingLink,
      action,
    } = body;

    if (!stallNumber) {
      return NextResponse.json({ success: false, message: 'Stall number is required.' }, { status: 400 });
    }

    const currentStall = await getStallByNumber(stallNumber);
    if (!currentStall) {
      return NextResponse.json({ success: false, message: `Stall ${stallNumber} not found.` }, { status: 404 });
    }

    // Action: Generate link for existing booked stall
    if (action === 'generate_link' && currentStall.bookingId) {
      const updatedBooking = await generateStallBookingLinkAndPass(currentStall.bookingId);
      const updatedStall = await getStallByNumber(stallNumber);
      return NextResponse.json({
        success: true,
        stall: updatedStall,
        booking: updatedBooking,
        passUrl: `/dandiyaraas/stall/pass/${updatedBooking.id}`,
        message: 'Digital pass link and QR generated successfully.',
      });
    }

    // If unbooking a stall that has a linked booking, clean up the booking
    if (isBooked === false) {
      if (currentStall.bookingId) {
        await deleteStallBooking(currentStall.bookingId);
      } else {
        await updateStall(stallNumber, {
          isBooked: false,
          bookingId: null,
          bookedByName: null,
          bookedByBrand: null,
          bookedByMobile: null,
          bookedByEmail: null,
          bookedAt: null,
        });
      }
      const updatedStall = await getStallByNumber(stallNumber);
      return NextResponse.json({ success: true, stall: updatedStall, message: `Stall ${stallNumber} marked as available.` });
    }

    // If booking or updating details for a stall
    if (isBooked === true) {
      if (currentStall.bookingId) {
        // Update existing booking
        const updatedBooking = await updateAdminStallBooking(currentStall.bookingId, {
          bookerName: bookedByName,
          brandName: bookedByBrand || bookedByName,
          mobile: bookedByMobile,
          email: bookedByEmail,
          amount: price !== undefined ? Number(price) : undefined,
          teamMembers,
          generateBookingLink: Boolean(generateBookingLink),
        });
        const updatedStall = await getStallByNumber(stallNumber);
        return NextResponse.json({
          success: true,
          stall: updatedStall,
          booking: updatedBooking,
          passUrl: updatedBooking.qrCodeDataUrl ? `/dandiyaraas/stall/pass/${updatedBooking.id}` : null,
          message: `Stall ${stallNumber} booking details updated successfully.`,
        });
      } else if (bookedByName && bookedByMobile) {
        // Create full booking for stall
        const createdBooking = await createAdminIssuedStallBooking({
          stallNumber,
          bookerName: bookedByName,
          brandName: bookedByBrand || bookedByName,
          mobile: bookedByMobile,
          email: bookedByEmail,
          amount: price !== undefined ? Number(price) : currentStall.price,
          teamMembers,
          generateBookingLink: Boolean(generateBookingLink),
        });
        const updatedStall = await getStallByNumber(stallNumber);
        return NextResponse.json({
          success: true,
          stall: updatedStall,
          booking: createdBooking,
          passUrl: createdBooking.qrCodeDataUrl ? `/dandiyaraas/stall/pass/${createdBooking.id}` : null,
          message: `Stall ${stallNumber} booked successfully!`,
        });
      }
    }

    // Fallback simple price/metadata update
    const updatePayload: any = {};
    if (price !== undefined) updatePayload.price = Number(price);
    if (typeof isBooked === 'boolean') updatePayload.isBooked = isBooked;
    if (bookedByName !== undefined) updatePayload.bookedByName = bookedByName || null;
    if (bookedByBrand !== undefined) updatePayload.bookedByBrand = bookedByBrand || null;
    if (bookedByMobile !== undefined) updatePayload.bookedByMobile = bookedByMobile || null;
    if (bookedByEmail !== undefined) updatePayload.bookedByEmail = bookedByEmail || null;

    const updated = await updateStall(stallNumber, updatePayload);
    return NextResponse.json({ success: true, stall: updated });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/stalls:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update stall.' },
      { status: 500 }
    );
  }
}
