import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db_store.json');

async function main() {
  console.log('🔄 Starting Fallback Store -> Neon PostgreSQL Migration...');

  if (!fs.existsSync(DATA_FILE)) {
    console.log('ℹ️ No .data/db_store.json file found. Nothing to sync.');
    return;
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const store = JSON.parse(raw);

  let insertedTickets = 0;
  let updatedTickets = 0;
  let insertedStalls = 0;
  let insertedTxs = 0;
  let insertedAmbs = 0;

  // 1. Ticket Bookings
  if (Array.isArray(store.ticketBookings)) {
    console.log(`📋 Found ${store.ticketBookings.length} local ticket bookings to inspect...`);
    for (const b of store.ticketBookings) {
      if (!b || (!b.id && !b.bookingNumber)) continue;

      const existing = await prisma.ticketBooking.findFirst({
        where: {
          OR: [
            ...(b.id ? [{ id: b.id }] : []),
            ...(b.bookingNumber ? [{ bookingNumber: b.bookingNumber }] : []),
          ],
        },
      });

      if (!existing) {
        await prisma.ticketBooking.create({
          data: {
            id: b.id,
            bookingNumber: b.bookingNumber || `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            fullName: b.fullName || 'Attendee',
            mobile: b.mobile || '',
            email: b.email || null,
            address: b.address || '',
            adultCount: b.adultCount || 1,
            childrenCount: b.childrenCount || 0,
            childrenNames: b.childrenNames ? (typeof b.childrenNames === 'string' ? b.childrenNames : JSON.stringify(b.childrenNames)) : null,
            phaseId: b.phaseId || null,
            phaseName: b.phaseName || 'Phase 1 - Early Bird',
            adultPrice: b.adultPrice || 499,
            childPrice: b.childPrice || 199,
            totalAmount: b.totalAmount ?? 0,
            voucherAmount: b.voucherAmount ?? 100,
            voucherBalance: b.voucherBalance ?? b.voucherAmount ?? 100,
            voucherApplicableTo: b.voucherApplicableTo || 'both',
            referredByAmbassadorId: b.referredByAmbassadorId || null,
            couponCode: b.couponCode || null,
            discountAmount: b.discountAmount || 0,
            razorpayOrderId: b.razorpayOrderId || null,
            razorpayPaymentId: b.razorpayPaymentId || null,
            razorpaySignature: b.razorpaySignature || null,
            paymentStatus: b.paymentStatus || 'pending',
            qrCodeDataUrl: b.qrCodeDataUrl || null,
            isCheckedIn: Boolean(b.isCheckedIn),
            checkedInAt: b.checkedInAt ? new Date(b.checkedInAt) : null,
            checkedInBy: b.checkedInBy || null,
            createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
          },
        });
        insertedTickets++;
        console.log(`  ➕ Inserted Ticket: ${b.bookingNumber} (${b.fullName}) [${b.paymentStatus}]`);
      } else if (b.paymentStatus === 'success' && existing.paymentStatus !== 'success') {
        await prisma.ticketBooking.update({
          where: { id: existing.id },
          data: {
            paymentStatus: 'success',
            razorpayOrderId: b.razorpayOrderId || existing.razorpayOrderId,
            razorpayPaymentId: b.razorpayPaymentId || existing.razorpayPaymentId,
            razorpaySignature: b.razorpaySignature || existing.razorpaySignature,
            qrCodeDataUrl: b.qrCodeDataUrl || existing.qrCodeDataUrl,
            isCheckedIn: Boolean(b.isCheckedIn || existing.isCheckedIn),
          },
        });
        updatedTickets++;
        console.log(`  🔄 Updated Ticket to Paid: ${b.bookingNumber}`);
      }
    }
  }

  // 2. Stall Bookings
  if (Array.isArray(store.bookings)) {
    console.log(`🎪 Found ${store.bookings.length} local stall bookings to inspect...`);
    for (const b of store.bookings) {
      if (!b || (!b.id && !b.bookingNumber)) continue;

      const existing = await prisma.booking.findFirst({
        where: {
          OR: [
            ...(b.id ? [{ id: b.id }] : []),
            ...(b.bookingNumber ? [{ bookingNumber: b.bookingNumber }] : []),
          ],
        },
      });

      if (!existing) {
        await prisma.booking.create({
          data: {
            id: b.id,
            bookingNumber: b.bookingNumber,
            stallNumber: b.stallNumber,
            amount: b.amount || 0,
            bookerName: b.bookerName || 'Exhibitor',
            brandName: b.brandName || '',
            email: b.email || '',
            mobile: b.mobile || '',
            stallType: b.stallType || 'commercial',
            teamMembers: b.teamMembers || '',
            razorpayOrderId: b.razorpayOrderId || null,
            razorpayPaymentId: b.razorpayPaymentId || null,
            razorpaySignature: b.razorpaySignature || null,
            paymentStatus: b.paymentStatus || 'pending',
            qrCodeDataUrl: b.qrCodeDataUrl || null,
            confirmationDocUrl: b.confirmationDocUrl || null,
            isCheckedIn: Boolean(b.isCheckedIn),
            checkedInAt: b.checkedInAt ? new Date(b.checkedInAt) : null,
            checkedInBy: b.checkedInBy || null,
            createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
          },
        });

        if (b.paymentStatus === 'success') {
          await prisma.stall.updateMany({
            where: { stallNumber: b.stallNumber },
            data: {
              isBooked: true,
              bookedByName: b.bookerName,
              bookedByBrand: b.brandName,
              bookedByMobile: b.mobile,
              bookedByEmail: b.email,
              bookedAt: b.createdAt ? new Date(b.createdAt) : new Date(),
              bookingId: b.id,
            },
          });
        }
        insertedStalls++;
        console.log(`  ➕ Inserted Stall Booking: ${b.bookingNumber} (${b.stallNumber})`);
      }
    }
  }

  // 3. Transactions
  if (Array.isArray(store.voucherTransactions)) {
    for (const tx of store.voucherTransactions) {
      if (!tx || !tx.id) continue;
      const existing = await prisma.voucherTransaction.findUnique({ where: { id: tx.id } });
      if (!existing) {
        await prisma.voucherTransaction.create({
          data: {
            id: tx.id,
            ticketBookingId: tx.ticketBookingId || null,
            ambassadorId: tx.ambassadorId || null,
            sourceType: tx.sourceType || 'ticket_booking',
            sourceReference: tx.sourceReference || 'N/A',
            stallNumber: tx.stallNumber || null,
            stallOwnerName: tx.stallOwnerName || null,
            amount: tx.amount || 0,
            type: tx.type || 'debit',
            description: tx.description || '',
            createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
          },
        });
        insertedTxs++;
      }
    }
  }

  // 4. Ambassadors
  if (Array.isArray(store.ambassadors)) {
    for (const amb of store.ambassadors) {
      if (!amb || (!amb.id && !amb.refCode)) continue;
      const existing = await prisma.ambassador.findFirst({
        where: {
          OR: [
            ...(amb.id ? [{ id: amb.id }] : []),
            ...(amb.refCode ? [{ refCode: amb.refCode }] : []),
            ...(amb.mobile ? [{ mobile: amb.mobile }] : []),
          ],
        },
      });

      if (!existing) {
        await prisma.ambassador.create({
          data: {
            id: amb.id,
            refCode: amb.refCode,
            name: amb.name || 'Ambassador',
            mobile: amb.mobile || '',
            email: amb.email || '',
            notes: amb.notes || null,
            passwordHash: amb.passwordHash || null,
            status: amb.status || 'pending',
            isActive: amb.isActive !== undefined ? Boolean(amb.isActive) : true,
            referralCount: amb.referralCount || 0,
            currentTier: amb.currentTier || 0,
            earnedFreeTicket: Boolean(amb.earnedFreeTicket),
            freeTicketBookingId: amb.freeTicketBookingId || null,
            voucherTotalCredited: amb.voucherTotalCredited || 0,
            voucherBalance: amb.voucherBalance || 0,
            createdAt: amb.createdAt ? new Date(amb.createdAt) : new Date(),
          },
        });
        insertedAmbs++;
      }
    }
  }

  console.log('\n=============================================');
  console.log('🎉 MIGRATION / SYNC COMPLETED SUCCESSFULLY:');
  console.log(`  - Ticket Bookings Inserted: ${insertedTickets}`);
  console.log(`  - Ticket Bookings Updated:  ${updatedTickets}`);
  console.log(`  - Stall Bookings Inserted:  ${insertedStalls}`);
  console.log(`  - Voucher Transactions:     ${insertedTxs}`);
  console.log(`  - Ambassadors:              ${insertedAmbs}`);
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
