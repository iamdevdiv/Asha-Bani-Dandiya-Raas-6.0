import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import {
  INITIAL_STALLS,
  INITIAL_CAROUSEL_IMAGES,
  DEFAULT_SETTINGS,
  INITIAL_TICKET_PHASES,
  INITIAL_AMBASSADOR_TIERS,
  INITIAL_COUPONS,
  CouponDef,
  StallDef,
  isFoodStall,
  isCommercialStall,
} from './stall-data';

// Global Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// File-based persistent fallback store for standalone development
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db_store.json');

interface FallbackStore {
  stalls: Array<{
    id: string;
    stallNumber: string;
    section: string;
    price: number;
    isBooked: boolean;
    bookedByName: string | null;
    bookedByBrand: string | null;
    bookedByMobile: string | null;
    bookedByEmail: string | null;
    bookedAt: string | null;
    bookingId: string | null;
    isCheckedIn?: boolean;
    checkedInAt?: string | null;
  }>;
  bookings: Array<{
    id: string;
    bookingNumber: string;
    stallNumber: string;
    amount: number;
    bookerName: string;
    brandName: string;
    email: string;
    mobile: string;
    stallType: string;
    teamMembers: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    paymentStatus: string;
    qrCodeDataUrl: string | null;
    confirmationDocUrl: string | null;
    isCheckedIn?: boolean;
    checkedInAt?: string | null;
    checkedInBy?: string | null;
    createdAt: string;
  }>;
  carouselImages: Array<{
    id: string;
    imageUrl: string;
    title: string | null;
    displayOrder: number;
    isActive: boolean;
  }>;
  settings: Record<string, string>;
  inquiries: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    preferredDate: string | null;
    preferredTime: string | null;
    message: string;
    status: string;
    createdAt: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    mobile: string;
    passwordHash: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  ticketPhases: Array<{
    id: string;
    phaseNumber: number;
    name: string;
    startDate: string;
    endDate: string;
    adultPrice: number;
    childPrice: number;
    voucherAmount: number;
    voucherApplicableTo: string;
    isActive: boolean;
  }>;
  ticketBookings: Array<{
    id: string;
    bookingNumber: string;
    fullName: string;
    mobile: string;
    email?: string | null;
    address: string;
    adultCount: number;
    childrenCount: number;
    childrenNames?: string | null;
    phaseId?: string | null;
    phaseName: string;
    adultPrice: number;
    childPrice: number;
    totalAmount: number;
    voucherAmount: number;
    voucherBalance: number;
    voucherApplicableTo: string;
    referredByAmbassadorId?: string | null;
    couponCode?: string | null;
    discountAmount?: number;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    razorpaySignature?: string | null;
    paymentStatus: string;
    qrCodeDataUrl?: string | null;
    isCheckedIn: boolean;
    checkedInAt?: string | null;
    checkedInBy?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  coupons?: Array<CouponDef>;
  voucherTransactions: Array<{
    id: string;
    ticketBookingId?: string | null;
    ambassadorId?: string | null;
    sourceType: string;
    sourceReference: string;
    stallNumber?: string | null;
    stallOwnerName?: string | null;
    amount: number;
    type: string; // 'credit' or 'debit'
    description: string;
    createdAt: string;
  }>;
  ambassadors: Array<{
    id: string;
    refCode: string;
    name: string;
    mobile: string;
    email: string;
    notes?: string | null;
    passwordHash?: string | null;
    status: string; // 'pending', 'approved', 'rejected'
    isActive: boolean;
    referralCount: number;
    currentTier: number;
    earnedFreeTicket: boolean;
    freeTicketBookingId?: string | null;
    voucherTotalCredited: number;
    voucherBalance: number;
    createdAt: string;
    updatedAt: string;
  }>;
  ambassadorTiers: Array<{
    id: string;
    tierLevel: number;
    name: string;
    referralsRequired: number;
    voucherAmount: number;
    voucherApplicableTo: string;
    grantsFreeTicket: boolean;
    isActive: boolean;
  }>;
  admin: {
    email: string;
    passwordHash: string;
    name: string;
  };
}

function getInitialStore(): FallbackStore {
  const defaultAdminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@ashabani2026';
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@ashabani.com';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(defaultAdminPass, salt);

  const stalls = INITIAL_STALLS.map((s) => ({
    id: `stall_${s.stallNumber}`,
    stallNumber: s.stallNumber,
    section: s.section,
    price: s.defaultPrice,
    isBooked: false,
    bookedByName: null,
    bookedByBrand: null,
    bookedByMobile: null,
    bookedByEmail: null,
    bookedAt: null,
    bookingId: null,
    isCheckedIn: false,
    checkedInAt: null,
  }));

  const carouselImages = INITIAL_CAROUSEL_IMAGES.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    title: img.title,
    displayOrder: img.displayOrder,
    isActive: img.isActive,
  }));

  return {
    stalls,
    bookings: [],
    carouselImages,
    inquiries: [],
    users: [],
    ticketPhases: [...INITIAL_TICKET_PHASES],
    ticketBookings: [],
    coupons: [...INITIAL_COUPONS],
    voucherTransactions: [],
    ambassadors: [],
    ambassadorTiers: [...INITIAL_AMBASSADOR_TIERS],
    settings: { ...DEFAULT_SETTINGS },
    admin: {
      email: defaultAdminEmail,
      passwordHash,
      name: 'Event Director',
    },
  };
}

let inMemoryStore: FallbackStore | null = null;

function loadFallbackStore(): FallbackStore {
  if (inMemoryStore) {
    if (!inMemoryStore.inquiries) inMemoryStore.inquiries = [];
    if (!inMemoryStore.users) inMemoryStore.users = [];
    if (!inMemoryStore.coupons) inMemoryStore.coupons = [...INITIAL_COUPONS];
    return inMemoryStore;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(data);
      if (inMemoryStore) {
        if (!inMemoryStore.inquiries) inMemoryStore.inquiries = [];
        if (!inMemoryStore.users) inMemoryStore.users = [];
      }
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn('Fallback store load notice:', err);
  }
  inMemoryStore = getInitialStore();
  saveFallbackStore(inMemoryStore);
  return inMemoryStore;
}

function saveFallbackStore(store: FallbackStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Fallback store write notice:', err);
  }
}

// Check if Prisma connection to PostgreSQL succeeds
let isPrismaAvailable: boolean | null = null;
async function checkPrisma(): Promise<boolean> {
  if (isPrismaAvailable !== null) return isPrismaAvailable;
  if (!process.env.DATABASE_URL) {
    isPrismaAvailable = false;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPrismaAvailable = true;
    return true;
  } catch {
    isPrismaAvailable = false;
    return false;
  }
}

// Database helper functions
export async function getStalls() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const count = await prisma.stall.count();
      if (count === 0) {
        // Seed stalls into database
        for (const s of INITIAL_STALLS) {
          await prisma.stall.create({
            data: {
              stallNumber: s.stallNumber,
              section: s.section,
              price: s.defaultPrice,
              isBooked: false,
            },
          });
        }
      }
      const stalls = await prisma.stall.findMany({
        orderBy: { stallNumber: 'asc' },
      });
      return stalls;
    } catch (e) {
      console.warn('Prisma error in getStalls, fallback to local store', e);
    }
  }
  const store = loadFallbackStore();
  return store.stalls;
}

export async function getStallByNumber(stallNumber: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const stall = await prisma.stall.findUnique({
        where: { stallNumber },
      });
      if (stall) return stall;
    } catch (e) {
      console.warn('Prisma error in getStallByNumber', e);
    }
  }
  const store = loadFallbackStore();
  return store.stalls.find((s) => s.stallNumber.toUpperCase() === stallNumber.toUpperCase()) || null;
}

export async function updateStall(
  stallNumber: string,
  data: Partial<{
    price: number;
    isBooked: boolean;
    bookedByName: string | null;
    bookedByBrand: string | null;
    bookedByMobile: string | null;
    bookedByEmail: string | null;
    bookingId: string | null;
    bookedAt?: string | null;
  }>
) {
  // Filter out undefined keys so only specified properties are updated
  const cleanData: any = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleanData[key] = val;
    }
  }

  if (cleanData.isBooked === true && cleanData.bookedAt === undefined) {
    cleanData.bookedAt = new Date().toISOString();
  } else if (cleanData.isBooked === false) {
    cleanData.bookedAt = null;
    cleanData.bookedByName = null;
    cleanData.bookedByBrand = null;
    cleanData.bookedByMobile = null;
    cleanData.bookedByEmail = null;
    cleanData.bookingId = null;
  }

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.stall.update({
        where: { stallNumber },
        data: cleanData,
      });
    } catch (e) {
      console.warn('Prisma error in updateStall', e);
    }
  }
  const store = loadFallbackStore();
  const index = store.stalls.findIndex((s) => s.stallNumber.toUpperCase() === stallNumber.toUpperCase());
  if (index !== -1) {
    store.stalls[index] = {
      ...store.stalls[index],
      ...cleanData,
    };
    saveFallbackStore(store);
    return store.stalls[index];
  }
  return null;
}

export async function markStallBooked(
  stallNumber: string,
  booking: {
    bookingId: string;
    bookerName: string;
    brandName: string;
    mobile: string;
    email: string;
  }
) {
  return updateStall(stallNumber, {
    isBooked: true,
    bookingId: booking.bookingId,
    bookedByName: booking.bookerName,
    bookedByBrand: booking.brandName,
    bookedByMobile: booking.mobile,
    bookedByEmail: booking.email,
  });
}

export async function markStallUnbooked(stallNumber: string) {
  return updateStall(stallNumber, {
    isBooked: false,
    bookingId: null,
    bookedByName: null,
    bookedByBrand: null,
    bookedByMobile: null,
    bookedByEmail: null,
  });
}

export async function createBooking(data: {
  bookingNumber: string;
  stallNumber: string;
  amount: number;
  bookerName: string;
  brandName: string;
  email: string;
  mobile: string;
  stallType: string;
  teamMembers: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus?: string;
  qrCodeDataUrl?: string;
  confirmationDocUrl?: string;
}) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const booking = await prisma.booking.create({
        data: {
          bookingNumber: data.bookingNumber,
          stallNumber: data.stallNumber,
          amount: data.amount,
          bookerName: data.bookerName,
          brandName: data.brandName,
          email: data.email,
          mobile: data.mobile,
          stallType: data.stallType,
          teamMembers: data.teamMembers,
          razorpayOrderId: data.razorpayOrderId || null,
          razorpayPaymentId: data.razorpayPaymentId || null,
          razorpaySignature: data.razorpaySignature || null,
          paymentStatus: data.paymentStatus || 'pending',
          qrCodeDataUrl: data.qrCodeDataUrl || null,
          confirmationDocUrl: data.confirmationDocUrl || null,
        },
      });
      return booking;
    } catch (e) {
      console.warn('Prisma error in createBooking', e);
    }
  }
  const store = loadFallbackStore();
  const newBooking = {
    id: `booking_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bookingNumber: data.bookingNumber,
    stallNumber: data.stallNumber,
    amount: data.amount,
    bookerName: data.bookerName,
    brandName: data.brandName,
    email: data.email,
    mobile: data.mobile,
    stallType: data.stallType,
    teamMembers: data.teamMembers,
    razorpayOrderId: data.razorpayOrderId || null,
    razorpayPaymentId: data.razorpayPaymentId || null,
    razorpaySignature: data.razorpaySignature || null,
    paymentStatus: data.paymentStatus || 'pending',
    qrCodeDataUrl: data.qrCodeDataUrl || null,
    confirmationDocUrl: data.confirmationDocUrl || null,
    createdAt: new Date().toISOString(),
  };
  store.bookings.push(newBooking);
  saveFallbackStore(store);
  return newBooking;
}

export async function getBookingById(id: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.booking.findUnique({ where: { id } });
    } catch (e) {
      console.warn('Prisma error in getBookingById', e);
    }
  }
  const store = loadFallbackStore();
  return store.bookings.find((b) => b.id === id) || null;
}

export async function getBookingByNumber(bookingNumber: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.booking.findUnique({ where: { bookingNumber } });
    } catch (e) {
      console.warn('Prisma error in getBookingByNumber', e);
    }
  }
  const store = loadFallbackStore();
  return store.bookings.find((b) => b.bookingNumber === bookingNumber) || null;
}

export async function getAllBookings() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma error in getAllBookings', e);
    }
  }
  const store = loadFallbackStore();
  return [...store.bookings].reverse();
}

export async function updateBookingPayment(
  bookingId: string,
  payment: {
    razorpayPaymentId: string;
    razorpaySignature?: string;
    paymentStatus: string;
    qrCodeDataUrl?: string;
    confirmationDocUrl?: string;
  }
) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.booking.update({
        where: { id: bookingId },
        data: {
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature,
          paymentStatus: payment.paymentStatus,
          qrCodeDataUrl: payment.qrCodeDataUrl,
          confirmationDocUrl: payment.confirmationDocUrl,
        },
      });
    } catch (e) {
      console.warn('Prisma error in updateBookingPayment', e);
    }
  }
  const store = loadFallbackStore();
  const index = store.bookings.findIndex((b) => b.id === bookingId);
  if (index !== -1) {
    store.bookings[index] = {
      ...store.bookings[index],
      ...payment,
      razorpaySignature: payment.razorpaySignature || store.bookings[index].razorpaySignature,
      qrCodeDataUrl: payment.qrCodeDataUrl || store.bookings[index].qrCodeDataUrl,
      confirmationDocUrl: payment.confirmationDocUrl || store.bookings[index].confirmationDocUrl,
    };
    saveFallbackStore(store);
    return store.bookings[index];
  }
  return null;
}

export async function getCarouselImages() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const count = await prisma.carouselImage.count();
      if (count === 0) {
        for (const img of INITIAL_CAROUSEL_IMAGES) {
          await prisma.carouselImage.create({
            data: {
              imageUrl: img.imageUrl,
              title: img.title,
              displayOrder: img.displayOrder,
              isActive: img.isActive,
            },
          });
        }
      }
      return await prisma.carouselImage.findMany({
        orderBy: { displayOrder: 'asc' },
      });
    } catch (e) {
      console.warn('Prisma error in getCarouselImages', e);
    }
  }
  const store = loadFallbackStore();
  return store.carouselImages.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function updateCarouselImages(
  images: Array<{ id?: string; imageUrl: string; title?: string | null; displayOrder: number; isActive: boolean }>
) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      await prisma.$transaction([
        prisma.carouselImage.deleteMany({}),
        prisma.carouselImage.createMany({
          data: images.map((img, idx) => ({
            imageUrl: img.imageUrl,
            title: img.title || null,
            displayOrder: img.displayOrder ?? idx + 1,
            isActive: img.isActive !== false,
          })),
        }),
      ]);
      return await prisma.carouselImage.findMany({
        orderBy: { displayOrder: 'asc' },
      });
    } catch (e) {
      console.warn('Prisma error in updateCarouselImages, falling back to local store', e);
    }
  }
  const store = loadFallbackStore();
  store.carouselImages = images.map((img, idx) => ({
    id: img.id || `img_${Date.now()}_${idx}`,
    imageUrl: img.imageUrl,
    title: img.title || null,
    displayOrder: img.displayOrder ?? idx + 1,
    isActive: img.isActive !== false,
  }));
  saveFallbackStore(store);
  return store.carouselImages;
}

export async function getSettings(): Promise<Record<string, string>> {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const settings = await prisma.siteSetting.findMany();
      if (settings.length > 0) {
        const map: Record<string, string> = { ...DEFAULT_SETTINGS };
        for (const s of settings) {
          map[s.key] = s.value;
        }
        return map;
      }
    } catch (e) {
      console.warn('Prisma error in getSettings', e);
    }
  }
  const store = loadFallbackStore();
  return { ...DEFAULT_SETTINGS, ...store.settings };
}

export async function updateSetting(key: string, value: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });

      // Synchronize Phase 1 start date if ticket_booking_start_date is updated
      if (key === 'ticket_booking_start_date' && value) {
        await (prisma as any).ticketPhase.updateMany({
          where: { phaseNumber: 1 },
          data: { startDate: value },
        });
      }

      // Synchronize universal voucher applicability across ticket phases & bookings
      if (key === 'ticket_voucher_applicable_to' && value) {
        await (prisma as any).ticketPhase.updateMany({
          data: { voucherApplicableTo: value },
        });
        await (prisma as any).ticketBooking.updateMany({
          data: { voucherApplicableTo: value },
        });
      }
    } catch (e) {
      console.warn('Prisma error in updateSetting', e);
    }
  }
  const store = loadFallbackStore();
  store.settings[key] = value;
  if (key === 'ticket_booking_start_date' && value && store.ticketPhases) {
    const p1 = store.ticketPhases.find((p) => p.phaseNumber === 1);
    if (p1) {
      p1.startDate = value;
    }
  }
  if (key === 'ticket_voucher_applicable_to' && value) {
    if (store.ticketPhases) {
      store.ticketPhases.forEach((p) => {
        p.voucherApplicableTo = value;
      });
    }
    if (store.ticketBookings) {
      store.ticketBookings.forEach((b) => {
        b.voucherApplicableTo = value;
      });
    }
  }
  saveFallbackStore(store);
  return store.settings;
}

export async function getAdminByEmail(email: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      let admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        const count = await prisma.admin.count();
        const configuredEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@ashabani.com').toLowerCase();
        if (count === 0 && email.toLowerCase() === configuredEmail) {
          const defaultAdminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@ashabani2026';
          const salt = bcrypt.genSaltSync(10);
          const passwordHash = bcrypt.hashSync(defaultAdminPass, salt);
          admin = await prisma.admin.create({
            data: {
              email: configuredEmail,
              name: 'Event Director',
              passwordHash,
            },
          });
        }
      }
      return admin;
    } catch (e) {
      console.warn('Prisma error in getAdminByEmail', e);
    }
  }
  const store = loadFallbackStore();
  if (store.admin.email.toLowerCase() === email.toLowerCase()) {
    return {
      id: 'admin_1',
      email: store.admin.email,
      passwordHash: store.admin.passwordHash,
      name: store.admin.name,
    };
  }
  return null;
}

export async function updateAdminPassword(email: string, newPasswordHash: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.admin.update({
        where: { email },
        data: { passwordHash: newPasswordHash },
      });
    } catch (e) {
      console.warn('Prisma error in updateAdminPassword', e);
    }
  }
  const store = loadFallbackStore();
  if (store.admin.email.toLowerCase() === email.toLowerCase()) {
    store.admin.passwordHash = newPasswordHash;
    saveFallbackStore(store);
    return true;
  }
  return false;
}

// INQUIRIES & MESSAGES
export async function getInquiries() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma error in getInquiries', e);
    }
  }
  const store = loadFallbackStore();
  return (store.inquiries || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createInquiry(data: {
  name: string;
  phone: string;
  email: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message: string;
}) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.inquiry.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          preferredDate: data.preferredDate || null,
          preferredTime: data.preferredTime || null,
          message: data.message,
          status: 'new',
        },
      });
    } catch (e) {
      console.warn('Prisma error in createInquiry', e);
    }
  }
  const store = loadFallbackStore();
  const newInquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name,
    phone: data.phone,
    email: data.email,
    preferredDate: data.preferredDate || null,
    preferredTime: data.preferredTime || null,
    message: data.message,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  if (!store.inquiries) store.inquiries = [];
  store.inquiries.unshift(newInquiry);
  saveFallbackStore(store);
  return newInquiry;
}

export async function updateInquiryStatus(id: string, status: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.inquiry.update({
        where: { id },
        data: { status },
      });
    } catch (e) {
      console.warn('Prisma error in updateInquiryStatus', e);
    }
  }
  const store = loadFallbackStore();
  const inq = store.inquiries?.find((i) => i.id === id);
  if (inq) {
    inq.status = status;
    saveFallbackStore(store);
    return inq;
  }
  return null;
}

export async function deleteInquiry(id: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.inquiry.delete({ where: { id } });
    } catch (e) {
      console.warn('Prisma error in deleteInquiry', e);
    }
  }
  const store = loadFallbackStore();
  if (store.inquiries) {
    store.inquiries = store.inquiries.filter((i) => i.id !== id);
    saveFallbackStore(store);
    return true;
  }
  return false;
}

// TEAM / ENTRY VERIFIER USERS
export async function getUsers() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          mobile: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma error in getUsers', e);
    }
  }
  const store = loadFallbackStore();
  return (store.users || []).map((u) => ({
    id: u.id,
    name: u.name,
    mobile: u.mobile,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));
}

export async function getUserByMobile(mobile: string) {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.user.findUnique({
        where: { mobile: cleanMobile },
      });
    } catch (e) {
      console.warn('Prisma error in getUserByMobile', e);
    }
  }
  const store = loadFallbackStore();
  return (store.users || []).find((u) => u.mobile === cleanMobile) || null;
}

export async function createUser(data: {
  name: string;
  mobile: string;
  password: string;
  role?: string;
}) {
  const cleanMobile = data.mobile.replace(/\D/g, '').slice(-10);
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(data.password, salt);
  const role = data.role || 'entry_verifier';

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          mobile: cleanMobile,
          passwordHash,
          role,
          isActive: true,
        },
      });
    } catch (e) {
      console.warn('Prisma error in createUser', e);
    }
  }
  const store = loadFallbackStore();
  if (store.users.some((u) => u.mobile === cleanMobile)) {
    throw new Error('User with this mobile number already exists.');
  }
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name,
    mobile: cleanMobile,
    passwordHash,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  store.users.unshift(newUser);
  saveFallbackStore(store);
  return {
    id: newUser.id,
    name: newUser.name,
    mobile: newUser.mobile,
    role: newUser.role,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
  };
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; mobile: string; password?: string; isActive: boolean; role: string }>
) {
  const cleanData: any = {};
  if (data.name) cleanData.name = data.name;
  if (data.mobile) cleanData.mobile = data.mobile.replace(/\D/g, '').slice(-10);
  if (data.role) cleanData.role = data.role;
  if (typeof data.isActive === 'boolean') cleanData.isActive = data.isActive;
  if (data.password && data.password.length >= 6) {
    const salt = bcrypt.genSaltSync(10);
    cleanData.passwordHash = bcrypt.hashSync(data.password, salt);
  }

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await prisma.user.update({
        where: { id },
        data: cleanData,
      });
    } catch (e) {
      console.warn('Prisma error in updateUser', e);
    }
  }
  const store = loadFallbackStore();
  const user = store.users?.find((u) => u.id === id);
  if (user) {
    Object.assign(user, cleanData);
    saveFallbackStore(store);
    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
  return null;
}

export async function deleteUser(id: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await (prisma as any).user.delete({ where: { id } });
    } catch (e) {
      console.warn('Prisma error in deleteUser', e);
    }
  }
  const store = loadFallbackStore();
  if (store.users) {
    store.users = store.users.filter((u) => u.id !== id);
    saveFallbackStore(store);
    return true;
  }
  return false;
}

// GATE ENTRY QR SCANNING & CHECK-IN
export async function verifyAndCheckInBooking(codeOrRef: string, verifierName: string = 'Gate Verifier') {
  let query = (codeOrRef || '').trim();

  // 1. If QR data is a JSON payload, parse it
  try {
    if (query.startsWith('{') && query.endsWith('}')) {
      const parsed = JSON.parse(query);
      if (parsed.bookingNo) query = String(parsed.bookingNo).trim();
      else if (parsed.bookingNumber) query = String(parsed.bookingNumber).trim();
      else if (parsed.ref) query = String(parsed.ref).trim();
      else if (parsed.bookingId) query = String(parsed.bookingId).trim();
      else if (parsed.id) query = String(parsed.id).trim();
      else if (parsed.stall) query = String(parsed.stall).trim();
      else if (parsed.stallNumber) query = String(parsed.stallNumber).trim();
    }
  } catch {}

  // 2. If QR data is a URL with query params
  if (query.includes('http') || query.includes('?')) {
    try {
      const urlObj = new URL(query.startsWith('http') ? query : `http://dummy.com/${query}`);
      const refParam = urlObj.searchParams.get('ref') || urlObj.searchParams.get('bookingId') || urlObj.searchParams.get('bookingNumber') || urlObj.searchParams.get('stall');
      if (refParam) query = refParam.trim();
    } catch {}
  }

  // 3. Clean query string
  query = query.trim();
  const cleanStall = query.replace(/^stall\s*/i, '').trim();

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      // Check Stall Booking first
      const stallBooking = await prisma.booking.findFirst({
        where: {
          OR: [
            { bookingNumber: { equals: query, mode: 'insensitive' } },
            { id: query },
            { stallNumber: query },
            { stallNumber: cleanStall },
          ],
        },
      });

      if (stallBooking) {
        if (stallBooking.isCheckedIn) {
          return {
            success: true,
            passType: 'stall' as const,
            alreadyCheckedIn: true,
            booking: stallBooking,
            message: 'DUPLICATE ENTRY ALERT: This stall pass has already been scanned!',
            checkedInAt: stallBooking.checkedInAt,
            checkedInBy: stallBooking.checkedInBy || 'Gate Verifier',
          };
        }

        const now = new Date();
        const updated = await prisma.booking.update({
          where: { id: stallBooking.id },
          data: {
            isCheckedIn: true,
            checkedInAt: now,
            checkedInBy: verifierName,
          },
        });

        // Also update stall status
        await prisma.stall.updateMany({
          where: { stallNumber: stallBooking.stallNumber },
          data: {
            isCheckedIn: true,
            checkedInAt: now,
          },
        });

        return {
          success: true,
          passType: 'stall' as const,
          alreadyCheckedIn: false,
          booking: updated,
          message: 'STALL PASS VERIFIED: Entry Approved',
        };
      }

      // Check Customer Ticket Booking
      const ticketBooking = await (prisma as any).ticketBooking.findFirst({
        where: {
          OR: [
            { bookingNumber: { equals: query, mode: 'insensitive' } },
            { id: query },
          ],
        },
      });

      if (ticketBooking) {
        if (ticketBooking.isCheckedIn) {
          return {
            success: true,
            passType: 'ticket' as const,
            alreadyCheckedIn: true,
            booking: ticketBooking,
            message: 'DUPLICATE ENTRY ALERT: This customer ticket pass has already been scanned!',
            checkedInAt: ticketBooking.checkedInAt,
            checkedInBy: ticketBooking.checkedInBy || 'Gate Verifier',
          };
        }

        const now = new Date();
        const updatedTicket = await (prisma as any).ticketBooking.update({
          where: { id: ticketBooking.id },
          data: {
            isCheckedIn: true,
            checkedInAt: now,
            checkedInBy: verifierName,
          },
        });

        return {
          success: true,
          passType: 'ticket' as const,
          alreadyCheckedIn: false,
          booking: updatedTicket,
          message: 'TICKET PASS VERIFIED: Entry Approved',
        };
      }

      return { success: false, message: `Invalid QR pass. No booking found matching "${query}".` };
    } catch (e) {
      console.warn('Prisma error in verifyAndCheckInBooking', e);
    }
  }

  const store = loadFallbackStore();
  // Check stall booking
  const stallBooking = store.bookings.find(
    (b) =>
      b.bookingNumber?.toLowerCase() === query.toLowerCase() ||
      b.id?.toLowerCase() === query.toLowerCase() ||
      b.stallNumber?.toLowerCase() === query.toLowerCase() ||
      b.stallNumber?.toLowerCase() === cleanStall.toLowerCase()
  );

  if (stallBooking) {
    if (stallBooking.isCheckedIn) {
      return {
        success: true,
        passType: 'stall' as const,
        alreadyCheckedIn: true,
        booking: stallBooking,
        message: 'DUPLICATE ENTRY ALERT: This stall pass has already been scanned!',
        checkedInAt: stallBooking.checkedInAt,
        checkedInBy: stallBooking.checkedInBy || 'Gate Verifier',
      };
    }

    const nowIso = new Date().toISOString();
    stallBooking.isCheckedIn = true;
    stallBooking.checkedInAt = nowIso;
    stallBooking.checkedInBy = verifierName;

    const stall = store.stalls.find((s) => s.stallNumber.toUpperCase() === stallBooking.stallNumber.toUpperCase());
    if (stall) {
      stall.isCheckedIn = true;
      stall.checkedInAt = nowIso;
    }

    saveFallbackStore(store);

    return {
      success: true,
      passType: 'stall' as const,
      alreadyCheckedIn: false,
      booking: stallBooking,
      message: 'STALL PASS VERIFIED: Entry Approved',
    };
  }

  // Check customer ticket booking in store
  const ticketBooking = (store.ticketBookings || []).find(
    (t) =>
      t.bookingNumber?.toLowerCase() === query.toLowerCase() ||
      t.id?.toLowerCase() === query.toLowerCase()
  );

  if (ticketBooking) {
    if (ticketBooking.isCheckedIn) {
      return {
        success: true,
        passType: 'ticket' as const,
        alreadyCheckedIn: true,
        booking: ticketBooking,
        message: 'DUPLICATE ENTRY ALERT: This customer ticket pass has already been scanned!',
        checkedInAt: ticketBooking.checkedInAt,
        checkedInBy: ticketBooking.checkedInBy || 'Gate Verifier',
      };
    }

    const nowIso = new Date().toISOString();
    ticketBooking.isCheckedIn = true;
    ticketBooking.checkedInAt = nowIso;
    ticketBooking.checkedInBy = verifierName;

    saveFallbackStore(store);

    return {
      success: true,
      passType: 'ticket' as const,
      alreadyCheckedIn: false,
      booking: ticketBooking,
      message: 'TICKET PASS VERIFIED: Entry Approved',
    };
  }

  return { success: false, message: `Invalid QR pass. No booking found matching "${query}".` };
}

// =========================================================================
// 8. TICKET PHASES & PRICING
// =========================================================================

export function getIndiaCurrentDate() {
  const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = istDate.getFullYear();
  const m = String(istDate.getMonth() + 1).padStart(2, '0');
  const d = String(istDate.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  return { istDate, dateStr };
}

export async function getTicketPhases() {
  const settings = await getSettings();
  const universalApplicableTo = settings.ticket_voucher_applicable_to || 'both';

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const phases = await (prisma as any).ticketPhase.findMany({
        orderBy: { phaseNumber: 'asc' },
      });
      if (phases && phases.length > 0) {
        return phases.map((p: any) => ({
          ...p,
          voucherApplicableTo: universalApplicableTo,
        }));
      }
    } catch (e) {
      console.warn('Prisma error in getTicketPhases', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ticketPhases || store.ticketPhases.length === 0) {
    store.ticketPhases = [...INITIAL_TICKET_PHASES];
    saveFallbackStore(store);
  }
  return store.ticketPhases
    .map((p) => ({ ...p, voucherApplicableTo: universalApplicableTo }))
    .sort((a, b) => a.phaseNumber - b.phaseNumber);
}

export async function getCurrentActivePhase() {
  const phases = await getTicketPhases();
  const { dateStr } = getIndiaCurrentDate();

  const activePhases = phases.filter((p: any) => p.isActive);
  if (activePhases.length === 0) {
    return phases[0] || INITIAL_TICKET_PHASES[0];
  }

  // Find phase whose date range matches today's IST date
  const matched = activePhases.find((p: any) => dateStr >= p.startDate && dateStr <= p.endDate);
  if (matched) return matched;

  // Fallback to closest future phase or first active phase
  const futurePhase = activePhases.find((p: any) => dateStr < p.startDate);
  return futurePhase || activePhases[0];
}

function addDaysToDateStr(dateStr: string, days: number): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

export async function saveTicketPhase(phaseData: any) {
  const hasPrisma = await checkPrisma();
  const currentPhaseNum = Number(phaseData.phaseNumber) || 1;
  const newStartDate = phaseData.startDate;
  const newEndDate = phaseData.endDate;

  let savedPhase: any = null;

  if (hasPrisma) {
    try {
      // 1. Save or update the target phase
      if (phaseData.id && !phaseData.id.startsWith('phase_new_')) {
        savedPhase = await (prisma as any).ticketPhase.update({
          where: { id: phaseData.id },
          data: {
            phaseNumber: currentPhaseNum,
            name: phaseData.name,
            startDate: newStartDate,
            endDate: newEndDate,
            adultPrice: Number(phaseData.adultPrice),
            childPrice: Number(phaseData.childPrice),
            voucherAmount: Number(phaseData.voucherAmount) || 100,
            voucherApplicableTo: phaseData.voucherApplicableTo || 'both',
            isActive: phaseData.isActive !== false,
          },
        });
      } else {
        savedPhase = await (prisma as any).ticketPhase.create({
          data: {
            phaseNumber: currentPhaseNum,
            name: phaseData.name,
            startDate: newStartDate,
            endDate: newEndDate,
            adultPrice: Number(phaseData.adultPrice),
            childPrice: Number(phaseData.childPrice),
            voucherAmount: Number(phaseData.voucherAmount) || 100,
            voucherApplicableTo: phaseData.voucherApplicableTo || 'both',
            isActive: phaseData.isActive !== false,
          },
        });
      }

      // 2. Cascade start date updates
      if (newStartDate) {
        if (currentPhaseNum === 1) {
          // Synchronize global ticket opening date in settings
          await prisma.siteSetting.upsert({
            where: { key: 'ticket_booking_start_date' },
            update: { value: newStartDate },
            create: { key: 'ticket_booking_start_date', value: newStartDate },
          });
        } else if (currentPhaseNum > 1) {
          // Automatic sync with previous phase end date (Phase N-1 end date = newStartDate - 1 day)
          const prevEndDate = addDaysToDateStr(newStartDate, -1);
          await (prisma as any).ticketPhase.updateMany({
            where: { phaseNumber: currentPhaseNum - 1 },
            data: { endDate: prevEndDate },
          });
        }
      }

      // 3. Cascade end date updates to next phase start date (Phase N+1 start date = newEndDate + 1 day)
      if (newEndDate) {
        const nextStartDate = addDaysToDateStr(newEndDate, 1);
        await (prisma as any).ticketPhase.updateMany({
          where: { phaseNumber: currentPhaseNum + 1 },
          data: { startDate: nextStartDate },
        });
      }
    } catch (e) {
      console.warn('Prisma error in saveTicketPhase', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ticketPhases) store.ticketPhases = [...INITIAL_TICKET_PHASES];

  const existingIdx = store.ticketPhases.findIndex((p) => p.id === phaseData.id);
  const formatted = {
    id: phaseData.id || `phase_${Date.now()}`,
    phaseNumber: currentPhaseNum,
    name: phaseData.name,
    startDate: newStartDate,
    endDate: newEndDate,
    adultPrice: Number(phaseData.adultPrice),
    childPrice: Number(phaseData.childPrice),
    voucherAmount: Number(phaseData.voucherAmount) || 100,
    voucherApplicableTo: phaseData.voucherApplicableTo || 'both',
    isActive: phaseData.isActive !== false,
  };

  if (existingIdx >= 0) {
    store.ticketPhases[existingIdx] = formatted;
  } else {
    store.ticketPhases.push(formatted);
  }

  // Cascade updates in fallback store
  if (newStartDate) {
    if (currentPhaseNum === 1) {
      store.settings['ticket_booking_start_date'] = newStartDate;
    } else if (currentPhaseNum > 1) {
      const prevPhase = store.ticketPhases.find((p) => p.phaseNumber === currentPhaseNum - 1);
      if (prevPhase) {
        prevPhase.endDate = addDaysToDateStr(newStartDate, -1);
      }
    }
  }

  if (newEndDate) {
    const nextPhase = store.ticketPhases.find((p) => p.phaseNumber === currentPhaseNum + 1);
    if (nextPhase) {
      nextPhase.startDate = addDaysToDateStr(newEndDate, 1);
    }
  }

  saveFallbackStore(store);
  return savedPhase || formatted;
}

export async function deleteTicketPhase(id: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      await (prisma as any).ticketPhase.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma error in deleteTicketPhase', e);
    }
  }

  const store = loadFallbackStore();
  if (store.ticketPhases) {
    store.ticketPhases = store.ticketPhases.filter((p) => p.id !== id);
    saveFallbackStore(store);
  }
  return true;
}

// =========================================================================
// 9. TICKET BOOKINGS & PASS GENERATION
// =========================================================================

export async function generateTicketQrCode(bookingNumber: string, attendeeName: string, adultCount: number, childrenCount: number): Promise<string> {
  const qrPayload = JSON.stringify({
    event: 'Asha Bani Dandiya Raas 6.0 (2026)',
    bookingNo: bookingNumber,
    type: 'CUSTOMER_TICKET',
    attendee: attendeeName,
    adults: adultCount,
    children: childrenCount,
    date: '13 October 2026',
    venue: 'Maharaja Agrasen Bhavan, Saharanpur',
    verificationUrl: `https://ashabani.com/verify-pass?ref=${encodeURIComponent(bookingNumber)}`,
  });

  return await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 400,
    color: {
      dark: '#450a0a',
      light: '#ffffff',
    },
  });
}

export async function createTicketBookingRecord(data: {
  fullName: string;
  mobile: string;
  email?: string;
  address: string;
  adultCount: number;
  childrenCount: number;
  childrenNames?: string[];
  referredByAmbassadorId?: string;
  couponCode?: string;
  discountAmount?: number;
}) {
  const phase = await getCurrentActivePhase();
  const adultPrice = phase.adultPrice || 499;
  const childPrice = phase.childPrice || 199;
  const voucherAmount = phase.voucherAmount || 100;
  const voucherApplicableTo = phase.voucherApplicableTo || 'both';

  const baseAmount = adultPrice * data.adultCount + childPrice * (data.childrenCount || 0);
  const discountAmount = Number(data.discountAmount) || 0;
  const totalAmount = Math.max(0, baseAmount - discountAmount);
  const bookingNumber = `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const created = await (prisma as any).ticketBooking.create({
        data: {
          bookingNumber,
          fullName: data.fullName,
          mobile: data.mobile,
          email: data.email || null,
          address: data.address,
          adultCount: data.adultCount || 1,
          childrenCount: data.childrenCount || 0,
          childrenNames: data.childrenNames ? JSON.stringify(data.childrenNames) : null,
          phaseId: phase.id,
          phaseName: phase.name,
          adultPrice,
          childPrice,
          totalAmount,
          voucherAmount,
          voucherBalance: voucherAmount,
          voucherApplicableTo,
          referredByAmbassadorId: data.referredByAmbassadorId || null,
          couponCode: data.couponCode ? data.couponCode.toUpperCase() : null,
          discountAmount,
          paymentStatus: 'pending',
          isCheckedIn: false,
        },
      });
      return created;
    } catch (e) {
      console.warn('Prisma error in createTicketBookingRecord', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ticketBookings) store.ticketBookings = [];

  const newTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingNumber,
    fullName: data.fullName,
    mobile: data.mobile,
    email: data.email || null,
    address: data.address,
    adultCount: data.adultCount || 1,
    childrenCount: data.childrenCount || 0,
    childrenNames: data.childrenNames ? JSON.stringify(data.childrenNames) : null,
    phaseId: phase.id,
    phaseName: phase.name,
    adultPrice,
    childPrice,
    totalAmount,
    voucherAmount,
    voucherBalance: voucherAmount,
    voucherApplicableTo,
    referredByAmbassadorId: data.referredByAmbassadorId || null,
    couponCode: data.couponCode ? data.couponCode.toUpperCase() : null,
    discountAmount,
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    paymentStatus: 'pending',
    qrCodeDataUrl: null,
    isCheckedIn: false,
    checkedInAt: null,
    checkedInBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.ticketBookings.push(newTicket);
  saveFallbackStore(store);
  return newTicket;
}

export async function completeTicketBookingPayment(params: {
  bookingId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}) {
  const booking = await getTicketBookingById(params.bookingId);
  if (!booking) throw new Error('Ticket booking not found');

  const qrCodeDataUrl = await generateTicketQrCode(
    booking.bookingNumber,
    booking.fullName,
    booking.adultCount,
    booking.childrenCount
  );

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const updated = await (prisma as any).ticketBooking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'success',
          razorpayOrderId: params.razorpayOrderId || null,
          razorpayPaymentId: params.razorpayPaymentId || null,
          razorpaySignature: params.razorpaySignature || null,
          qrCodeDataUrl,
        },
      });

      // Record Initial Voucher Credit in Transaction History
      await (prisma as any).voucherTransaction.create({
        data: {
          ticketBookingId: booking.id,
          sourceType: 'ticket_booking',
          sourceReference: booking.bookingNumber,
          amount: booking.voucherAmount,
          type: 'credit',
          description: `+₹${booking.voucherAmount} Stall Voucher Included with Ticket Booking ${booking.bookingNumber}`,
        },
      });

      // If referred by ambassador, increment their referral and check tiers
      if (booking.referredByAmbassadorId) {
        await creditAmbassadorReferral(booking.referredByAmbassadorId, booking.id);
      }

      return updated;
    } catch (e) {
      console.warn('Prisma error in completeTicketBookingPayment', e);
    }
  }

  const store = loadFallbackStore();
  const record = (store.ticketBookings || []).find((b) => b.id === params.bookingId || b.bookingNumber === params.bookingId);
  if (record) {
    record.paymentStatus = 'success';
    record.razorpayOrderId = params.razorpayOrderId || null;
    record.razorpayPaymentId = params.razorpayPaymentId || null;
    record.razorpaySignature = params.razorpaySignature || null;
    record.qrCodeDataUrl = qrCodeDataUrl;
    record.updatedAt = new Date().toISOString();

    if (!store.voucherTransactions) store.voucherTransactions = [];
    store.voucherTransactions.push({
      id: `vt_${Date.now()}`,
      ticketBookingId: record.id,
      ambassadorId: null,
      sourceType: 'ticket_booking',
      sourceReference: record.bookingNumber,
      stallNumber: null,
      stallOwnerName: null,
      amount: record.voucherAmount,
      type: 'credit',
      description: `+₹${record.voucherAmount} Stall Voucher Included with Ticket Booking ${record.bookingNumber}`,
      createdAt: new Date().toISOString(),
    });

    saveFallbackStore(store);

    if (record.referredByAmbassadorId) {
      await creditAmbassadorReferral(record.referredByAmbassadorId, record.id);
    }
  }

  return record;
}

function parseBookingVoucherRule(rawRule: string | null | undefined): {
  isCustomException: boolean;
  exceptionRule: 'food' | 'other' | 'both' | null;
} {
  if (!rawRule) return { isCustomException: false, exceptionRule: null };
  const clean = rawRule.trim().toLowerCase();
  if (clean === 'default' || clean === 'inherit') {
    return { isCustomException: false, exceptionRule: null };
  }
  if (clean.startsWith('override_')) {
    const target = clean.replace('override_', '') as 'food' | 'other' | 'both';
    if (['food', 'other', 'both'].includes(target)) {
      return { isCustomException: true, exceptionRule: target };
    }
  }
  return { isCustomException: false, exceptionRule: null };
}

export async function getTicketBookingById(idOrBookingNumber: string) {
  const settings = await getSettings();
  const universalApplicableTo = settings.ticket_voucher_applicable_to || 'both';

  let rawBooking: any = null;
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      rawBooking = await (prisma as any).ticketBooking.findFirst({
        where: {
          OR: [{ id: idOrBookingNumber }, { bookingNumber: idOrBookingNumber }],
        },
      });
    } catch (e) {
      console.warn('Prisma error in getTicketBookingById', e);
    }
  }

  if (!rawBooking) {
    const store = loadFallbackStore();
    rawBooking = (store.ticketBookings || []).find(
      (t) => t.id === idOrBookingNumber || t.bookingNumber?.toLowerCase() === idOrBookingNumber.toLowerCase()
    );
  }

  if (!rawBooking) return null;

  // Check if this booking is linked to an ambassador complimentary ticket
  const ambassador = await getAmbassadorByTicketBookingId(rawBooking.id);
  if (ambassador) {
    const tiers = await getAmbassadorTiers();
    const currentTier = tiers.find((t: any) => Number(t.tierLevel) === Number(ambassador.currentTier)) || tiers[0];
    const tierApplicableTo = currentTier?.voucherApplicableTo || 'both';

    const { isCustomException, exceptionRule } = parseBookingVoucherRule(rawBooking.voucherApplicableTo);
    const effectiveApplicableTo = isCustomException && exceptionRule ? exceptionRule : tierApplicableTo;

    return {
      ...rawBooking,
      voucherAmount: typeof ambassador.voucherTotalCredited === 'number' ? ambassador.voucherTotalCredited : (rawBooking.voucherAmount ?? 0),
      voucherBalance: typeof ambassador.voucherBalance === 'number' ? ambassador.voucherBalance : (rawBooking.voucherBalance ?? 0),
      voucherApplicableTo: effectiveApplicableTo,
      effectiveVoucherApplicableTo: effectiveApplicableTo,
      rawVoucherRule: rawBooking.voucherApplicableTo,
      isAmbassadorPass: true,
      ambassadorId: ambassador.id,
      ambassadorRefCode: ambassador.refCode,
      tierVoucherApplicableTo: tierApplicableTo,
      ruleSource: isCustomException ? ('custom_exception' as const) : ('ambassador_tier' as const),
      isCustomVoucherRule: isCustomException,
    };
  }

  const { isCustomException, exceptionRule } = parseBookingVoucherRule(rawBooking.voucherApplicableTo);
  const effectiveApplicableTo = isCustomException && exceptionRule ? exceptionRule : universalApplicableTo;

  return {
    ...rawBooking,
    isAmbassadorPass: false,
    voucherApplicableTo: effectiveApplicableTo,
    effectiveVoucherApplicableTo: effectiveApplicableTo,
    rawVoucherRule: rawBooking.voucherApplicableTo,
    ruleSource: isCustomException ? ('custom_exception' as const) : ('global' as const),
    isCustomVoucherRule: isCustomException,
  };
}

export async function getTicketBookings(filters?: { phaseId?: string; paymentStatus?: string; search?: string }) {
  const settings = await getSettings();
  const universalApplicableTo = settings.ticket_voucher_applicable_to || 'both';
  const ambassadors = await getAmbassadors();
  const tiers = await getAmbassadorTiers();

  const ambMapByBookingId = new Map<string, any>();
  for (const amb of ambassadors) {
    if (amb.freeTicketBookingId) {
      ambMapByBookingId.set(amb.freeTicketBookingId, amb);
    }
    ambMapByBookingId.set(amb.id, amb);
  }

  const resolveBookingMeta = (b: any) => {
    const amb = ambMapByBookingId.get(b.id) || (b.isAmbassadorPass && ambMapByBookingId.get(b.ambassadorId));
    if (amb) {
      const currentTier = tiers.find((t: any) => Number(t.tierLevel) === Number(amb.currentTier)) || tiers[0];
      const tierApplicableTo = currentTier?.voucherApplicableTo || 'both';

      const { isCustomException, exceptionRule } = parseBookingVoucherRule(b.voucherApplicableTo);
      const effectiveApplicableTo = isCustomException && exceptionRule ? exceptionRule : tierApplicableTo;

      return {
        ...b,
        isAmbassadorPass: true,
        ambassadorId: amb.id,
        ambassadorRefCode: amb.refCode,
        voucherBalance: amb.voucherBalance ?? b.voucherBalance,
        voucherApplicableTo: effectiveApplicableTo,
        effectiveVoucherApplicableTo: effectiveApplicableTo,
        rawVoucherRule: b.voucherApplicableTo,
        tierVoucherApplicableTo: tierApplicableTo,
        ruleSource: isCustomException ? ('custom_exception' as const) : ('ambassador_tier' as const),
        isCustomVoucherRule: isCustomException,
      };
    }

    const { isCustomException, exceptionRule } = parseBookingVoucherRule(b.voucherApplicableTo);
    const effectiveApplicableTo = isCustomException && exceptionRule ? exceptionRule : universalApplicableTo;

    return {
      ...b,
      isAmbassadorPass: false,
      voucherApplicableTo: effectiveApplicableTo,
      effectiveVoucherApplicableTo: effectiveApplicableTo,
      rawVoucherRule: b.voucherApplicableTo,
      ruleSource: isCustomException ? ('custom_exception' as const) : ('global' as const),
      isCustomVoucherRule: isCustomException,
    };
  };

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const where: any = {};
      if (filters?.phaseId) where.phaseId = filters.phaseId;
      if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
      if (filters?.search) {
        where.OR = [
          { fullName: { contains: filters.search, mode: 'insensitive' } },
          { mobile: { contains: filters.search } },
          { bookingNumber: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      const bookings = await (prisma as any).ticketBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return bookings.map(resolveBookingMeta);
    } catch (e) {
      console.warn('Prisma error in getTicketBookings', e);
    }
  }

  const store = loadFallbackStore();
  let list = store.ticketBookings || [];
  if (filters?.phaseId) list = list.filter((b) => b.phaseId === filters.phaseId);
  if (filters?.paymentStatus) list = list.filter((b) => b.paymentStatus === filters.paymentStatus);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (b) =>
        b.fullName.toLowerCase().includes(q) ||
        b.mobile.includes(q) ||
        b.bookingNumber.toLowerCase().includes(q)
    );
  }
  return list
    .map(resolveBookingMeta)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateTicketBookingVoucherRule(
  ticketBookingId: string,
  voucherApplicableTo: 'default' | 'food' | 'other' | 'both'
) {
  const storedValue = voucherApplicableTo === 'default' ? 'default' : `override_${voucherApplicableTo}`;

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const updated = await (prisma as any).ticketBooking.update({
        where: { id: ticketBookingId },
        data: { voucherApplicableTo: storedValue },
      });
      return { success: true, booking: updated };
    } catch (e) {
      console.warn('Prisma error in updateTicketBookingVoucherRule', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ticketBookings) store.ticketBookings = [];
  const b = store.ticketBookings.find((t) => t.id === ticketBookingId);
  if (!b) throw new Error('Ticket booking not found');
  b.voucherApplicableTo = storedValue;
  saveFallbackStore(store);
  return { success: true, booking: b };
}

// =========================================================================
// 10. STALL VOUCHER WALLET & REDEMPTIONS
// =========================================================================

export async function getVoucherWallet(idOrBookingNumber: string) {
  const settings = await getSettings();
  const universalTicketApplicableTo = settings.ticket_voucher_applicable_to || 'both';

  // Check if it's a customer ticket booking or linked ambassador ticket
  const ticketBooking = await getTicketBookingById(idOrBookingNumber);
  if (ticketBooking) {
    if (ticketBooking.isAmbassadorPass && ticketBooking.ambassadorId) {
      const transactions = await getVoucherTransactions({ ambassadorId: ticketBooking.ambassadorId });
      return {
        type: 'ambassador' as const,
        id: ticketBooking.ambassadorId,
        ticketBookingId: ticketBooking.id,
        reference: ticketBooking.bookingNumber,
        holderName: ticketBooking.fullName,
        holderRef: ticketBooking.bookingNumber,
        ownerName: ticketBooking.fullName,
        balance: ticketBooking.voucherBalance,
        totalCredited: ticketBooking.voucherAmount,
        applicableTo: ticketBooking.effectiveVoucherApplicableTo || ticketBooking.tierVoucherApplicableTo || 'both',
        isCustomRule: Boolean(ticketBooking.isCustomVoucherRule),
        transactions,
      };
    }

    const transactions = await getVoucherTransactions({ ticketBookingId: ticketBooking.id });
    const applicableTo = ticketBooking.effectiveVoucherApplicableTo || universalTicketApplicableTo;

    return {
      type: 'ticket' as const,
      id: ticketBooking.id,
      reference: ticketBooking.bookingNumber,
      holderName: ticketBooking.fullName,
      holderRef: ticketBooking.bookingNumber,
      ownerName: ticketBooking.fullName,
      balance: ticketBooking.voucherBalance,
      totalCredited: ticketBooking.voucherAmount,
      applicableTo,
      isCustomRule: Boolean(ticketBooking.isCustomVoucherRule),
      transactions,
    };
  }

  // Check if it's an ambassador wallet
  const ambassador = await getAmbassadorById(idOrBookingNumber);
  if (ambassador) {
    const transactions = await getVoucherTransactions({ ambassadorId: ambassador.id });
    const tiers = await getAmbassadorTiers();
    const currentTier = tiers.find((t: any) => t.tierLevel === ambassador.currentTier) || tiers[0];
    const applicableTo = currentTier?.voucherApplicableTo || 'both';

    return {
      type: 'ambassador' as const,
      id: ambassador.id,
      reference: ambassador.refCode,
      holderName: ambassador.name,
      holderRef: ambassador.refCode,
      ownerName: ambassador.name,
      balance: ambassador.voucherBalance,
      totalCredited: ambassador.voucherTotalCredited,
      applicableTo,
      transactions,
    };
  }

  return null;
}

export async function getVoucherTransactions(params: { ticketBookingId?: string; ambassadorId?: string; stallNumber?: string }) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const where: any = {};
      if (params.ticketBookingId) where.ticketBookingId = params.ticketBookingId;
      if (params.ambassadorId) where.ambassadorId = params.ambassadorId;
      if (params.stallNumber) where.stallNumber = params.stallNumber;
      return await (prisma as any).voucherTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma error in getVoucherTransactions', e);
    }
  }

  const store = loadFallbackStore();
  let list = store.voucherTransactions || [];
  if (params.ticketBookingId) list = list.filter((t) => t.ticketBookingId === params.ticketBookingId);
  if (params.ambassadorId) list = list.filter((t) => t.ambassadorId === params.ambassadorId);
  if (params.stallNumber) list = list.filter((t) => t.stallNumber === params.stallNumber);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function redeemStallVoucher(params: {
  walletId: string;
  walletType: 'ticket' | 'ambassador';
  stallNumber: string;
  amount: number;
}) {
  const cleanStall = params.stallNumber.toUpperCase().replace(/^STALL\s*/i, '').trim();
  const stall = await getStallByNumber(cleanStall);
  const stallOwnerName = stall?.bookedByBrand || stall?.bookedByName || `Stall ${cleanStall} Exhibitor`;
  const isFood = isFoodStall(cleanStall);

  if (params.amount <= 0) {
    throw new Error('Voucher redemption amount must be greater than ₹0');
  }

  const settings = await getSettings();
  const universalTicketApplicableTo = settings.ticket_voucher_applicable_to || 'both';

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      // Check if walletId belongs to an ambassador directly or via an ambassador complimentary ticket
      const ambassador = (await (prisma as any).ambassador.findFirst({
        where: {
          OR: [{ id: params.walletId }, { freeTicketBookingId: params.walletId }],
        },
      })) || (params.walletType === 'ambassador' ? await (prisma as any).ambassador.findUnique({ where: { id: params.walletId } }) : null);

      if (ambassador) {
        if (ambassador.voucherBalance < params.amount) {
          throw new Error(`Insufficient voucher balance. Available: ₹${ambassador.voucherBalance}`);
        }

        const tiers = await getAmbassadorTiers();
        const currentTier = tiers.find((t: any) => t.tierLevel === ambassador.currentTier) || tiers[0];
        const applicableTo = currentTier?.voucherApplicableTo || 'both';

        if (applicableTo === 'food' && !isFood) {
          throw new Error(`This voucher is valid for Food Stalls only (Stalls 1–15). Stall ${cleanStall} is a Commercial & Shopping Stall.`);
        }
        if (applicableTo === 'other' && isFood) {
          throw new Error(`This voucher is valid for Commercial & Shopping Stalls only (Stalls A–T). Stall ${cleanStall} is a Food Stall.`);
        }

        const newBalance = ambassador.voucherBalance - params.amount;
        await (prisma as any).ambassador.update({
          where: { id: ambassador.id },
          data: { voucherBalance: newBalance },
        });

        // Also sync linked ticket booking if exists
        if (ambassador.freeTicketBookingId) {
          try {
            await (prisma as any).ticketBooking.update({
              where: { id: ambassador.freeTicketBookingId },
              data: { voucherBalance: newBalance },
            });
          } catch {
            // Ignore if booking ID lookup differs
          }
        }

        const tx = await (prisma as any).voucherTransaction.create({
          data: {
            ambassadorId: ambassador.id,
            ticketBookingId: ambassador.freeTicketBookingId || null,
            sourceType: 'ambassador_reward',
            sourceReference: ambassador.refCode,
            stallNumber: cleanStall,
            stallOwnerName,
            amount: params.amount,
            type: 'debit',
            description: `Payment of ₹${params.amount} to Stall ${cleanStall} (${stallOwnerName})`,
          },
        });

        return { success: true, balance: newBalance, transaction: tx };
      }

      // Standard customer ticket booking
      const booking = await (prisma as any).ticketBooking.findUnique({ where: { id: params.walletId } });
      if (!booking) throw new Error('Ticket pass not found');
      if (booking.voucherBalance < params.amount) {
        throw new Error(`Insufficient voucher balance. Available: ₹${booking.voucherBalance}`);
      }

      // Category validation using booking rule exception or universal ticket setting
      const isCustomException =
        booking.voucherApplicableTo &&
        booking.voucherApplicableTo !== 'default' &&
        booking.voucherApplicableTo !== 'inherit';
      const effectiveApplicableTo = isCustomException ? booking.voucherApplicableTo : universalTicketApplicableTo;

      if (effectiveApplicableTo === 'food' && !isFood) {
        throw new Error(`This voucher is valid for Food Stalls only (Stalls 1–15). Stall ${cleanStall} is a Commercial & Shopping Stall.`);
      }
      if (effectiveApplicableTo === 'other' && isFood) {
        throw new Error(`This voucher is valid for Commercial & Shopping Stalls only (Stalls A–T). Stall ${cleanStall} is a Food Stall.`);
      }

      const newBalance = booking.voucherBalance - params.amount;
      await (prisma as any).ticketBooking.update({
        where: { id: booking.id },
        data: { voucherBalance: newBalance },
      });

      const tx = await (prisma as any).voucherTransaction.create({
        data: {
          ticketBookingId: booking.id,
          sourceType: 'ticket_booking',
          sourceReference: booking.bookingNumber,
          stallNumber: cleanStall,
          stallOwnerName,
          amount: params.amount,
          type: 'debit',
          description: `Payment of ₹${params.amount} to Stall ${cleanStall} (${stallOwnerName})`,
        },
      });

      return { success: true, balance: newBalance, transaction: tx };
    } catch (e: any) {
      console.warn('Prisma error in redeemStallVoucher', e);
      throw e;
    }
  }

  const store = loadFallbackStore();
  const amb =
    (store.ambassadors || []).find((a) => a.id === params.walletId || a.freeTicketBookingId === params.walletId);

  if (amb) {
    if (amb.voucherBalance < params.amount) {
      throw new Error(`Insufficient voucher balance. Available: ₹${amb.voucherBalance}`);
    }

    const tiers = await getAmbassadorTiers();
    const currentTier = tiers.find((t: any) => t.tierLevel === amb.currentTier) || tiers[0];
    const applicableTo = currentTier?.voucherApplicableTo || 'both';

    if (applicableTo === 'food' && !isFood) {
      throw new Error(`This voucher is valid for Food Stalls only (Stalls 1–15). Stall ${cleanStall} is a Commercial & Shopping Stall.`);
    }
    if (applicableTo === 'other' && isFood) {
      throw new Error(`This voucher is valid for Commercial & Shopping Stalls only (Stalls A–T). Stall ${cleanStall} is a Food Stall.`);
    }

    amb.voucherBalance -= params.amount;
    if (amb.freeTicketBookingId) {
      const linkedTicket = (store.ticketBookings || []).find((b) => b.id === amb.freeTicketBookingId);
      if (linkedTicket) linkedTicket.voucherBalance = amb.voucherBalance;
    }

    const tx = {
      id: `vt_${Date.now()}`,
      ticketBookingId: amb.freeTicketBookingId || null,
      ambassadorId: amb.id,
      sourceType: 'ambassador_reward',
      sourceReference: amb.refCode,
      stallNumber: cleanStall,
      stallOwnerName,
      amount: params.amount,
      type: 'debit',
      description: `Payment of ₹${params.amount} to Stall ${cleanStall} (${stallOwnerName})`,
      createdAt: new Date().toISOString(),
    };

    if (!store.voucherTransactions) store.voucherTransactions = [];
    store.voucherTransactions.push(tx);
    saveFallbackStore(store);
    return { success: true, balance: amb.voucherBalance, transaction: tx };
  }

  const booking = (store.ticketBookings || []).find((b) => b.id === params.walletId);
  if (!booking) throw new Error('Ticket pass not found');
  if (booking.voucherBalance < params.amount) {
    throw new Error(`Insufficient voucher balance. Available: ₹${booking.voucherBalance}`);
  }

  const isCustomException =
    booking.voucherApplicableTo &&
    booking.voucherApplicableTo !== 'default' &&
    booking.voucherApplicableTo !== 'inherit';
  const effectiveApplicableTo = isCustomException ? booking.voucherApplicableTo : universalTicketApplicableTo;

  if (effectiveApplicableTo === 'food' && !isFood) {
    throw new Error(`This voucher is valid for Food Stalls only (Stalls 1–15). Stall ${cleanStall} is a Commercial & Shopping Stall.`);
  }
  if (effectiveApplicableTo === 'other' && isFood) {
    throw new Error(`This voucher is valid for Commercial & Shopping Stalls only (Stalls A–T). Stall ${cleanStall} is a Food Stall.`);
  }

  booking.voucherBalance -= params.amount;
  const tx = {
    id: `vt_${Date.now()}`,
    ticketBookingId: booking.id,
    ambassadorId: null,
    sourceType: 'ticket_booking',
    sourceReference: booking.bookingNumber,
    stallNumber: cleanStall,
    stallOwnerName,
    amount: params.amount,
    type: 'debit',
    description: `Payment of ₹${params.amount} to Stall ${cleanStall} (${stallOwnerName})`,
    createdAt: new Date().toISOString(),
  };

  if (!store.voucherTransactions) store.voucherTransactions = [];
  store.voucherTransactions.push(tx);
  saveFallbackStore(store);
  return { success: true, balance: booking.voucherBalance, transaction: tx };
}

export async function getStallVoucherEarnings() {
  const stalls = await getStalls();
  const transactions = await getVoucherTransactions({});
  const allBookings = await getAllBookings();

  const earningsMap: Record<string, { totalEarned: number; txCount: number }> = {};
  for (const tx of transactions) {
    if (tx.stallNumber && tx.type === 'debit') {
      const s = tx.stallNumber.toUpperCase();
      if (!earningsMap[s]) earningsMap[s] = { totalEarned: 0, txCount: 0 };
      earningsMap[s].totalEarned += tx.amount;
      earningsMap[s].txCount += 1;
    }
  }

  const bookingMap: Record<string, any> = {};
  for (const b of allBookings) {
    if (b.stallNumber) {
      bookingMap[b.stallNumber.toUpperCase()] = b;
    }
  }

  return stalls.map((s) => {
    const b = bookingMap[s.stallNumber.toUpperCase()];
    return {
      stallNumber: s.stallNumber,
      section: s.section,
      brandName: s.bookedByBrand || s.bookedByName || (b ? (b.brandName || b.bookerName) : 'Available'),
      isBooked: s.isBooked || !!b,
      voucherEarnings: earningsMap[s.stallNumber.toUpperCase()]?.totalEarned || 0,
      transactionCount: earningsMap[s.stallNumber.toUpperCase()]?.txCount || 0,
      booking: b ? {
        id: b.id,
        bookingNumber: b.bookingNumber,
        bookerName: b.bookerName,
        brandName: b.brandName,
        mobile: b.mobile,
        email: b.email,
        stallType: b.stallType,
        teamMembers: b.teamMembers,
        amount: b.amount,
        paymentStatus: b.paymentStatus,
        isCheckedIn: b.isCheckedIn,
        checkedInAt: b.checkedInAt,
        checkedInBy: b.checkedInBy,
        createdAt: b.createdAt,
      } : (s.bookedByName || s.bookedByBrand ? {
        bookedAt: s.bookedAt,
      } : null),
    };
  });
}

export async function getStallVoucherTransactionsWithSender(stallNumber: string) {
  const cleanStall = String(stallNumber || '').toUpperCase().replace(/^STALL\s*/i, '').trim();
  const allTxs = await getVoucherTransactions({ stallNumber: cleanStall });
  const ticketBookings = await getTicketBookings();
  const ambassadors = await getAmbassadors();

  const bookingMap = new Map<string, any>();
  const bookingRefMap = new Map<string, any>();
  for (const b of ticketBookings) {
    if (b.id) bookingMap.set(b.id, b);
    if (b.bookingNumber) bookingRefMap.set(b.bookingNumber.toUpperCase(), b);
  }

  const ambMap = new Map<string, any>();
  const ambRefMap = new Map<string, any>();
  for (const a of ambassadors) {
    if (a.id) ambMap.set(a.id, a);
    if (a.refCode) ambRefMap.set(a.refCode.toUpperCase(), a);
  }

  const transactions = allTxs
    .filter((tx: any) => {
      const s = String(tx.stallNumber || '').toUpperCase().replace(/^STALL\s*/i, '').trim();
      return s === cleanStall;
    })
    .map((tx: any) => {
      const b =
        (tx.ticketBookingId && bookingMap.get(tx.ticketBookingId)) ||
        (tx.sourceReference && bookingRefMap.get(tx.sourceReference.toUpperCase()));
      const amb =
        (tx.ambassadorId && ambMap.get(tx.ambassadorId)) ||
        (tx.sourceReference && ambRefMap.get(tx.sourceReference.toUpperCase()));

      const senderName = b?.fullName || (amb ? `${amb.name} (Ambassador)` : null) || 'Festival Attendee';
      const senderMobile = b?.mobile || amb?.mobile || null;
      const senderRef = tx.sourceReference || b?.bookingNumber || amb?.refCode || 'N/A';

      return {
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        senderName,
        senderMobile,
        senderRef,
        sourceType: tx.sourceType,
        description: tx.description,
        createdAt: tx.createdAt,
      };
    });

  const totalEarned = transactions
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  return {
    stallNumber: cleanStall,
    totalEarned,
    transactionCount: transactions.length,
    transactions,
  };
}

// =========================================================================
// 11. CAMPUS AMBASSADOR & REFERRALS
// =========================================================================

export async function getAmbassadorTiers() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const tiers = await (prisma as any).ambassadorTier.findMany({
        orderBy: { tierLevel: 'asc' },
      });
      if (tiers && tiers.length > 0) return tiers;
    } catch (e) {
      console.warn('Prisma error in getAmbassadorTiers', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ambassadorTiers || store.ambassadorTiers.length === 0) {
    store.ambassadorTiers = [...INITIAL_AMBASSADOR_TIERS];
    saveFallbackStore(store);
  }
  return store.ambassadorTiers.sort((a, b) => a.tierLevel - b.tierLevel);
}

export async function saveAmbassadorTier(tierData: any) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      if (tierData.id && !tierData.id.startsWith('tier_new_')) {
        return await (prisma as any).ambassadorTier.update({
          where: { id: tierData.id },
          data: {
            tierLevel: Number(tierData.tierLevel) || 1,
            name: tierData.name,
            referralsRequired: Number(tierData.referralsRequired),
            voucherAmount: Number(tierData.voucherAmount),
            voucherApplicableTo: tierData.voucherApplicableTo || 'both',
            grantsFreeTicket: tierData.grantsFreeTicket !== false,
            isActive: tierData.isActive !== false,
          },
        });
      } else {
        return await (prisma as any).ambassadorTier.create({
          data: {
            tierLevel: Number(tierData.tierLevel) || 1,
            name: tierData.name,
            referralsRequired: Number(tierData.referralsRequired),
            voucherAmount: Number(tierData.voucherAmount),
            voucherApplicableTo: tierData.voucherApplicableTo || 'both',
            grantsFreeTicket: tierData.grantsFreeTicket !== false,
            isActive: tierData.isActive !== false,
          },
        });
      }
    } catch (e) {
      console.warn('Prisma error in saveAmbassadorTier', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ambassadorTiers) store.ambassadorTiers = [...INITIAL_AMBASSADOR_TIERS];

  const idx = store.ambassadorTiers.findIndex((t) => t.id === tierData.id);
  const formatted = {
    id: tierData.id || `tier_${Date.now()}`,
    tierLevel: Number(tierData.tierLevel) || store.ambassadorTiers.length + 1,
    name: tierData.name,
    referralsRequired: Number(tierData.referralsRequired),
    voucherAmount: Number(tierData.voucherAmount),
    voucherApplicableTo: tierData.voucherApplicableTo || 'both',
    grantsFreeTicket: tierData.grantsFreeTicket !== false,
    isActive: tierData.isActive !== false,
  };

  if (idx >= 0) store.ambassadorTiers[idx] = formatted;
  else store.ambassadorTiers.push(formatted);

  saveFallbackStore(store);
  return formatted;
}

export async function submitAmbassadorApplication(data: { name: string; mobile: string; email: string; notes?: string }) {
  const cleanMobile = data.mobile.replace(/\D/g, '').slice(-10);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const cleanNamePrefix = data.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'AMB';
  const refCode = `AMB_${cleanNamePrefix}${randomSuffix}`;

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await (prisma as any).ambassador.create({
        data: {
          refCode,
          name: data.name,
          mobile: cleanMobile,
          email: data.email,
          notes: data.notes || null,
          status: 'pending',
          isActive: true,
          referralCount: 0,
          currentTier: 0,
          earnedFreeTicket: false,
          voucherTotalCredited: 0,
          voucherBalance: 0,
        },
      });
    } catch (e) {
      console.warn('Prisma error in submitAmbassadorApplication', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.ambassadors) store.ambassadors = [];

  const newAmb = {
    id: `amb_${Date.now()}`,
    refCode,
    name: data.name,
    mobile: cleanMobile,
    email: data.email,
    notes: data.notes || null,
    passwordHash: null,
    status: 'pending',
    isActive: true,
    referralCount: 0,
    currentTier: 0,
    earnedFreeTicket: false,
    freeTicketBookingId: null,
    voucherTotalCredited: 0,
    voucherBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.ambassadors.push(newAmb);
  saveFallbackStore(store);
  return newAmb;
}

export async function getAmbassadors() {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await (prisma as any).ambassador.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma error in getAmbassadors', e);
    }
  }

  const store = loadFallbackStore();
  return (store.ambassadors || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAmbassadorById(idOrRefCode: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await (prisma as any).ambassador.findFirst({
        where: {
          OR: [{ id: idOrRefCode }, { refCode: idOrRefCode }, { mobile: idOrRefCode }],
        },
      });
    } catch (e) {
      console.warn('Prisma error in getAmbassadorById', e);
    }
  }

  const store = loadFallbackStore();
  return (store.ambassadors || []).find(
    (a) => a.id === idOrRefCode || a.refCode.toLowerCase() === idOrRefCode.toLowerCase() || a.mobile === idOrRefCode
  );
}

export async function getAmbassadorByTicketBookingId(ticketBookingIdOrNumber: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const amb = await (prisma as any).ambassador.findFirst({
        where: {
          OR: [
            { freeTicketBookingId: ticketBookingIdOrNumber },
            { id: ticketBookingIdOrNumber },
          ],
        },
      });
      if (amb) return amb;
    } catch (e) {
      console.warn('Prisma error in getAmbassadorByTicketBookingId', e);
    }
  }

  const store = loadFallbackStore();
  return (
    (store.ambassadors || []).find(
      (a) =>
        a.freeTicketBookingId === ticketBookingIdOrNumber ||
        a.id === ticketBookingIdOrNumber
    ) || null
  );
}

export async function approveAmbassador(id: string, plainPassword?: string, status = 'approved') {
  let passwordHash: string | undefined;
  if (plainPassword && plainPassword.trim().length > 0) {
    passwordHash = bcrypt.hashSync(plainPassword.trim(), 10);
  }

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const data: any = { status };
      if (passwordHash) data.passwordHash = passwordHash;
      return await (prisma as any).ambassador.update({
        where: { id },
        data,
      });
    } catch (e) {
      console.warn('Prisma error in approveAmbassador', e);
    }
  }

  const store = loadFallbackStore();
  const amb = (store.ambassadors || []).find((a) => a.id === id);
  if (amb) {
    amb.status = status;
    if (passwordHash) amb.passwordHash = passwordHash;
    amb.updatedAt = new Date().toISOString();
    saveFallbackStore(store);
  }
  return amb;
}

export async function ambassadorLogin(mobile: string, plainPassword: string) {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const amb = await getAmbassadorById(cleanMobile);
  if (!amb) {
    return { success: false, message: 'No ambassador found with this mobile number.' };
  }

  if (amb.status !== 'approved') {
    return { success: false, message: 'Your ambassador application is pending approval by the event admin.' };
  }

  if (!amb.passwordHash) {
    return { success: false, message: 'Account password has not been assigned by admin yet.' };
  }

  const match = bcrypt.compareSync(plainPassword, amb.passwordHash);
  if (!match) {
    return { success: false, message: 'Invalid password. Please check your credentials.' };
  }

  return { success: true, ambassador: amb };
}

export async function creditAmbassadorReferral(ambassadorId: string, bookingId: string) {
  const amb = await getAmbassadorById(ambassadorId);
  if (!amb) return;

  const newReferralCount = (amb.referralCount || 0) + 1;
  const tiers = await getAmbassadorTiers();

  // Evaluate qualifying tier
  let qualifiedTier = 0;
  let newVoucherTotal = amb.voucherTotalCredited || 0;
  let voucherDelta = 0;
  let earnTicket = amb.earnedFreeTicket;
  let freeTicketBookingId = amb.freeTicketBookingId;

  for (const tier of tiers) {
    if (newReferralCount >= tier.referralsRequired && tier.tierLevel > amb.currentTier) {
      qualifiedTier = tier.tierLevel;
      // Calculate delta so we don't roll over/double-count
      voucherDelta = tier.voucherAmount - (amb.voucherTotalCredited || 0);
      if (voucherDelta > 0) {
        newVoucherTotal = tier.voucherAmount;
      }
      if (tier.grantsFreeTicket && !earnTicket) {
        earnTicket = true;
      }
    }
  }

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      // If qualified for free ticket and not generated yet, create free ticket booking
      if (earnTicket && !freeTicketBookingId) {
        const freeBookingNumber = `TK-FREE-${Math.floor(1000 + Math.random() * 9000)}`;
        const qrCodeDataUrl = await generateTicketQrCode(freeBookingNumber, amb.name, 1, 0);

        const freeTicket = await (prisma as any).ticketBooking.create({
          data: {
            bookingNumber: freeBookingNumber,
            fullName: `${amb.name} (Ambassador)`,
            mobile: amb.mobile,
            email: amb.email,
            address: 'Ambassador Complimentary Pass',
            adultCount: 1,
            childrenCount: 0,
            phaseName: 'Ambassador Reward',
            adultPrice: 0,
            childPrice: 0,
            totalAmount: 0,
            voucherAmount: newVoucherTotal,
            voucherBalance: (amb.voucherBalance || 0) + (voucherDelta > 0 ? voucherDelta : 0),
            paymentStatus: 'success',
            qrCodeDataUrl,
          },
        });
        freeTicketBookingId = freeTicket.id;
      }

      const updatedAmb = await (prisma as any).ambassador.update({
        where: { id: amb.id },
        data: {
          referralCount: newReferralCount,
          currentTier: qualifiedTier > amb.currentTier ? qualifiedTier : amb.currentTier,
          earnedFreeTicket: earnTicket,
          freeTicketBookingId,
          voucherTotalCredited: newVoucherTotal,
          voucherBalance: (amb.voucherBalance || 0) + (voucherDelta > 0 ? voucherDelta : 0),
        },
      });

      // Also ensure existing free ticket booking reflects the latest voucher balance
      if (freeTicketBookingId) {
        try {
          await (prisma as any).ticketBooking.update({
            where: { id: freeTicketBookingId },
            data: {
              voucherAmount: newVoucherTotal,
              voucherBalance: (amb.voucherBalance || 0) + (voucherDelta > 0 ? voucherDelta : 0),
            },
          });
        } catch {
          // ignore
        }
      }

      // Record Milestone Credit Transaction if voucher awarded
      if (voucherDelta > 0) {
        await (prisma as any).voucherTransaction.create({
          data: {
            ambassadorId: amb.id,
            sourceType: 'ambassador_reward',
            sourceReference: amb.refCode,
            amount: voucherDelta,
            type: 'credit',
            description: `+₹${voucherDelta} Tier ${qualifiedTier} Ambassador Milestone Reward Unlocked (${newReferralCount} Referrals)`,
          },
        });
      }

      return updatedAmb;
    } catch (e) {
      console.warn('Prisma error in creditAmbassadorReferral', e);
    }
  }

  const store = loadFallbackStore();
  const record = (store.ambassadors || []).find((a) => a.id === amb.id);
  if (record) {
    record.referralCount = newReferralCount;
    if (qualifiedTier > record.currentTier) {
      record.currentTier = qualifiedTier;
    }
    if (earnTicket) {
      record.earnedFreeTicket = true;
      if (!record.freeTicketBookingId) {
        const freeBookingNumber = `TK-FREE-${Math.floor(1000 + Math.random() * 9000)}`;
        const qrCodeDataUrl = await generateTicketQrCode(freeBookingNumber, record.name, 1, 0);
        const freeTicket = {
          id: `ticket_free_${Date.now()}`,
          bookingNumber: freeBookingNumber,
          fullName: `${record.name} (Ambassador)`,
          mobile: record.mobile,
          email: record.email,
          address: 'Ambassador Complimentary Pass',
          adultCount: 1,
          childrenCount: 0,
          phaseName: 'Ambassador Reward',
          adultPrice: 0,
          childPrice: 0,
          totalAmount: 0,
          voucherAmount: newVoucherTotal,
          voucherBalance: (record.voucherBalance || 0) + (voucherDelta > 0 ? voucherDelta : 0),
          voucherApplicableTo: 'both',
          paymentStatus: 'success',
          qrCodeDataUrl,
          isCheckedIn: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!store.ticketBookings) store.ticketBookings = [];
        store.ticketBookings.push(freeTicket);
        record.freeTicketBookingId = freeTicket.id;
      }
    }

    if (voucherDelta > 0) {
      record.voucherTotalCredited = newVoucherTotal;
      record.voucherBalance += voucherDelta;

      // Sync existing free ticket if already created
      if (record.freeTicketBookingId) {
        const linkedTicket = (store.ticketBookings || []).find((b) => b.id === record.freeTicketBookingId);
        if (linkedTicket) {
          linkedTicket.voucherAmount = newVoucherTotal;
          linkedTicket.voucherBalance = record.voucherBalance;
        }
      }

      if (!store.voucherTransactions) store.voucherTransactions = [];
      store.voucherTransactions.push({
        id: `vt_${Date.now()}`,
        ticketBookingId: record.freeTicketBookingId || null,
        ambassadorId: record.id,
        sourceType: 'ambassador_reward',
        sourceReference: record.refCode,
        stallNumber: null,
        stallOwnerName: null,
        amount: voucherDelta,
        type: 'credit',
        description: `+₹${voucherDelta} Tier ${qualifiedTier} Ambassador Milestone Reward Unlocked (${newReferralCount} Referrals)`,
        createdAt: new Date().toISOString(),
      });
    }

    saveFallbackStore(store);
  }
}

export async function getAmbassadorDashboardData(ambassadorId: string) {
  const amb = await getAmbassadorById(ambassadorId);
  if (!amb) return null;

  const tiers = await getAmbassadorTiers();
  const transactions = await getVoucherTransactions({ ambassadorId: amb.id });

  // Get referred bookings list (sanitized: only Attendee Name and Date)
  let referralsList: Array<{ name: string; date: string; bookingNumber: string }> = [];
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const bookings = await (prisma as any).ticketBooking.findMany({
        where: { referredByAmbassadorId: amb.id, paymentStatus: 'success' },
        select: { fullName: true, createdAt: true, bookingNumber: true },
        orderBy: { createdAt: 'desc' },
      });
      referralsList = bookings.map((b: any) => ({
        name: b.fullName,
        date: new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        bookingNumber: b.bookingNumber,
      }));
    } catch (e) {
      console.warn('Prisma error in getAmbassadorDashboardData', e);
    }
  } else {
    const store = loadFallbackStore();
    referralsList = (store.ticketBookings || [])
      .filter((b) => b.referredByAmbassadorId === amb.id && b.paymentStatus === 'success')
      .map((b) => ({
        name: b.fullName,
        date: new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        bookingNumber: b.bookingNumber,
      }));
  }

  const activePhase = await getCurrentActivePhase();

  return {
    ambassador: {
      id: amb.id,
      refCode: amb.refCode,
      name: amb.name,
      mobile: amb.mobile,
      email: amb.email,
      referralCount: amb.referralCount || 0,
      currentTier: amb.currentTier || 0,
      earnedFreeTicket: amb.earnedFreeTicket || false,
      freeTicketBookingId: amb.freeTicketBookingId || null,
      voucherBalance: amb.voucherBalance || 0,
      voucherTotalCredited: amb.voucherTotalCredited || 0,
    },
    activePhase,
    tiers,
    referralsList,
    transactions,
  };
}

// =========================================================================
// 12. COUPON / PROMO CODE MANAGEMENT
// =========================================================================

export async function getCoupons(): Promise<CouponDef[]> {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const list = await (prisma as any).coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return list.map((c: any) => ({
        ...c,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString().split('T')[0] : null,
      }));
    } catch (e) {
      console.warn('Prisma error in getCoupons', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.coupons) store.coupons = [...INITIAL_COUPONS];
  return store.coupons;
}

export async function getCouponByCode(code: string): Promise<CouponDef | null> {
  const cleanCode = code.trim().toUpperCase();
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const c = await (prisma as any).coupon.findUnique({
        where: { code: cleanCode },
      });
      if (c) {
        return {
          ...c,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString().split('T')[0] : null,
        };
      }
    } catch (e) {
      console.warn('Prisma error in getCouponByCode', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.coupons) store.coupons = [...INITIAL_COUPONS];
  return store.coupons.find((c) => c.code.toUpperCase() === cleanCode) || null;
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxUses?: number | null;
  minOrderAmount?: number;
  expiresAt?: string | null;
  isActive?: boolean;
}): Promise<CouponDef> {
  const cleanCode = data.code.trim().toUpperCase();
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const created = await (prisma as any).coupon.create({
        data: {
          code: cleanCode,
          description: data.description || null,
          discountType: data.discountType || 'percentage',
          discountValue: Number(data.discountValue) || 0,
          maxUses: data.maxUses ? Number(data.maxUses) : null,
          minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : 0,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          isActive: data.isActive !== false,
        },
      });
      return {
        ...created,
        expiresAt: created.expiresAt ? created.expiresAt.toISOString().split('T')[0] : null,
      };
    } catch (e) {
      console.warn('Prisma error in createCoupon', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.coupons) store.coupons = [...INITIAL_COUPONS];

  const existing = store.coupons.find((c) => c.code.toUpperCase() === cleanCode);
  if (existing) {
    throw new Error(`Coupon code ${cleanCode} already exists.`);
  }

  const newCoupon: CouponDef = {
    id: `coupon_${Date.now()}`,
    code: cleanCode,
    description: data.description || undefined,
    discountType: data.discountType || 'percentage',
    discountValue: Number(data.discountValue) || 0,
    maxUses: data.maxUses ? Number(data.maxUses) : null,
    usedCount: 0,
    minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : 0,
    expiresAt: data.expiresAt || null,
    isActive: data.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.coupons.unshift(newCoupon);
  saveFallbackStore(store);
  return newCoupon;
}

export async function updateCoupon(id: string, data: Partial<CouponDef>): Promise<CouponDef | null> {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const updateData: any = {};
      if (data.code) updateData.code = data.code.trim().toUpperCase();
      if (data.description !== undefined) updateData.description = data.description;
      if (data.discountType) updateData.discountType = data.discountType;
      if (data.discountValue !== undefined) updateData.discountValue = Number(data.discountValue);
      if (data.maxUses !== undefined) updateData.maxUses = data.maxUses ? Number(data.maxUses) : null;
      if (data.minOrderAmount !== undefined) updateData.minOrderAmount = Number(data.minOrderAmount);
      if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const updated = await (prisma as any).coupon.update({
        where: { id },
        data: updateData,
      });
      return {
        ...updated,
        expiresAt: updated.expiresAt ? updated.expiresAt.toISOString().split('T')[0] : null,
      };
    } catch (e) {
      console.warn('Prisma error in updateCoupon', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.coupons) store.coupons = [...INITIAL_COUPONS];
  const coupon = store.coupons.find((c) => c.id === id);
  if (!coupon) return null;

  if (data.code) coupon.code = data.code.trim().toUpperCase();
  if (data.description !== undefined) coupon.description = data.description;
  if (data.discountType) coupon.discountType = data.discountType;
  if (data.discountValue !== undefined) coupon.discountValue = Number(data.discountValue);
  if (data.maxUses !== undefined) coupon.maxUses = data.maxUses ? Number(data.maxUses) : null;
  if (data.minOrderAmount !== undefined) coupon.minOrderAmount = Number(data.minOrderAmount);
  if (data.expiresAt !== undefined) coupon.expiresAt = data.expiresAt || null;
  if (data.isActive !== undefined) coupon.isActive = data.isActive;
  coupon.updatedAt = new Date().toISOString();

  saveFallbackStore(store);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      await (prisma as any).coupon.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma error in deleteCoupon', e);
    }
  }

  const store = loadFallbackStore();
  if (!store.coupons) store.coupons = [...INITIAL_COUPONS];
  const idx = store.coupons.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.coupons.splice(idx, 1);
    saveFallbackStore(store);
    return true;
  }
  return false;
}

export async function validateAndApplyCoupon(code: string, orderAmount: number) {
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return { isValid: false, message: 'Invalid coupon code. Please verify and try again.' };
  }

  if (!coupon.isActive) {
    return { isValid: false, message: 'This coupon code is currently inactive.' };
  }

  if (coupon.expiresAt) {
    const expiry = new Date(coupon.expiresAt).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    if (expiry < today) {
      return { isValid: false, message: 'This coupon code has expired.' };
    }
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { isValid: false, message: 'This coupon code has reached its maximum usage limit.' };
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return {
      isValid: false,
      message: `This coupon requires a minimum booking amount of ₹${coupon.minOrderAmount}. Current total: ₹${orderAmount}.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.min(orderAmount, Math.round((orderAmount * coupon.discountValue) / 100));
  } else {
    discountAmount = Math.min(orderAmount, coupon.discountValue);
  }

  const finalAmount = Math.max(0, orderAmount - discountAmount);

  return {
    isValid: true,
    coupon,
    discountAmount,
    finalAmount,
    isFreePass: finalAmount === 0,
    message: discountAmount === orderAmount ? '100% Free Pass Applied!' : `Discount of ₹${discountAmount} applied!`,
  };
}

export async function recordCouponUsage(couponIdOrCode: string) {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      await (prisma as any).coupon.updateMany({
        where: {
          OR: [{ id: couponIdOrCode }, { code: couponIdOrCode.toUpperCase() }],
        },
        data: { usedCount: { increment: 1 } },
      });
      return;
    } catch (e) {
      console.warn('Prisma error in recordCouponUsage', e);
    }
  }

  const store = loadFallbackStore();
  if (store.coupons) {
    const c = store.coupons.find((cp) => cp.id === couponIdOrCode || cp.code.toUpperCase() === couponIdOrCode.toUpperCase());
    if (c) {
      c.usedCount = (c.usedCount || 0) + 1;
      saveFallbackStore(store);
    }
  }
}

// =========================================================================
// 13. ORDER DELETION, VOUCHER TOP-UP, AND AMBASSADOR REFERRED BOOKINGS
// =========================================================================

export async function deleteTicketBooking(id: string): Promise<boolean> {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      // Delete any voucher transactions related to this booking
      await (prisma as any).voucherTransaction.deleteMany({
        where: { ticketBookingId: id },
      });
      await (prisma as any).ticketBooking.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      console.warn('Prisma error in deleteTicketBooking', e);
    }
  }

  const store = loadFallbackStore();
  if (store.ticketBookings) {
    const idx = store.ticketBookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      store.ticketBookings.splice(idx, 1);
      if (store.voucherTransactions) {
        store.voucherTransactions = store.voucherTransactions.filter((vt) => vt.ticketBookingId !== id);
      }
      saveFallbackStore(store);
      return true;
    }
  }
  return false;
}

export async function deleteStallBooking(id: string): Promise<boolean> {
  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const booking = await (prisma as any).booking.findUnique({ where: { id } });
      if (booking) {
        // Free up the stall
        await (prisma as any).stall.updateMany({
          where: { stallNumber: booking.stallNumber },
          data: {
            isBooked: false,
            bookedByName: null,
            bookedByBrand: null,
            bookedByMobile: null,
            bookedByEmail: null,
            bookedAt: null,
            bookingId: null,
            isCheckedIn: false,
            checkedInAt: null,
          },
        });
        await (prisma as any).booking.delete({ where: { id } });
        return true;
      }
    } catch (e) {
      console.warn('Prisma error in deleteStallBooking', e);
    }
  }

  const store = loadFallbackStore();
  if (store.bookings) {
    const idx = store.bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const booking = store.bookings[idx];
      store.bookings.splice(idx, 1);

      // Reset stall
      const stall = store.stalls.find((s) => s.stallNumber.toUpperCase() === booking.stallNumber.toUpperCase());
      if (stall) {
        stall.isBooked = false;
        stall.bookedByName = null;
        stall.bookedByBrand = null;
        stall.bookedByMobile = null;
        stall.bookedByEmail = null;
        stall.bookedAt = null;
        stall.bookingId = null;
        stall.isCheckedIn = false;
        stall.checkedInAt = null;
      }

      saveFallbackStore(store);
      return true;
    }
  }
  return false;
}

export async function topUpTicketVoucherBalance(params: {
  ticketBookingId: string;
  additionalAmount: number;
  reason?: string;
}) {
  if (params.additionalAmount <= 0) {
    throw new Error('Top-up amount must be greater than ₹0');
  }

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      const booking = await (prisma as any).ticketBooking.findUnique({
        where: { id: params.ticketBookingId },
      });
      if (!booking) throw new Error('Ticket booking not found');

      const newVoucherAmount = (booking.voucherAmount || 0) + params.additionalAmount;
      const newVoucherBalance = (booking.voucherBalance || 0) + params.additionalAmount;

      const updated = await (prisma as any).ticketBooking.update({
        where: { id: booking.id },
        data: {
          voucherAmount: newVoucherAmount,
          voucherBalance: newVoucherBalance,
        },
      });

      // Record credit voucher transaction
      const tx = await (prisma as any).voucherTransaction.create({
        data: {
          ticketBookingId: booking.id,
          sourceType: 'admin_adjustment',
          sourceReference: booking.bookingNumber,
          amount: params.additionalAmount,
          type: 'credit',
          description: params.reason || `+₹${params.additionalAmount} Admin Voucher Balance Top-Up`,
        },
      });

      // If linked to ambassador, also sync ambassador wallet
      const ambassador = await getAmbassadorByTicketBookingId(booking.id);
      if (ambassador) {
        await (prisma as any).ambassador.update({
          where: { id: ambassador.id },
          data: {
            voucherTotalCredited: (ambassador.voucherTotalCredited || 0) + params.additionalAmount,
            voucherBalance: (ambassador.voucherBalance || 0) + params.additionalAmount,
          },
        });
      }

      return { success: true, booking: updated, transaction: tx };
    } catch (e) {
      console.warn('Prisma error in topUpTicketVoucherBalance', e);
      throw e;
    }
  }

  const store = loadFallbackStore();
  const booking = (store.ticketBookings || []).find((b) => b.id === params.ticketBookingId);
  if (!booking) throw new Error('Ticket booking not found');

  booking.voucherAmount = (booking.voucherAmount || 0) + params.additionalAmount;
  booking.voucherBalance = (booking.voucherBalance || 0) + params.additionalAmount;
  booking.updatedAt = new Date().toISOString();

  const tx = {
    id: `vt_${Date.now()}`,
    ticketBookingId: booking.id,
    ambassadorId: null,
    sourceType: 'admin_adjustment',
    sourceReference: booking.bookingNumber,
    stallNumber: null,
    stallOwnerName: null,
    amount: params.additionalAmount,
    type: 'credit',
    description: params.reason || `+₹${params.additionalAmount} Admin Voucher Balance Top-Up`,
    createdAt: new Date().toISOString(),
  };

  if (!store.voucherTransactions) store.voucherTransactions = [];
  store.voucherTransactions.push(tx);

  // Sync ambassador if linked
  const amb = (store.ambassadors || []).find((a) => a.id === booking.id || a.freeTicketBookingId === booking.id);
  if (amb) {
    amb.voucherTotalCredited = (amb.voucherTotalCredited || 0) + params.additionalAmount;
    amb.voucherBalance = (amb.voucherBalance || 0) + params.additionalAmount;
  }

  saveFallbackStore(store);
  return { success: true, booking, transaction: tx };
}

export async function getAmbassadorReferredBookings(ambassadorIdOrRef: string) {
  const amb = await getAmbassadorById(ambassadorIdOrRef);
  if (!amb) return [];

  const hasPrisma = await checkPrisma();
  if (hasPrisma) {
    try {
      return await (prisma as any).ticketBooking.findMany({
        where: {
          OR: [{ referredByAmbassadorId: amb.id }, { referredByAmbassadorId: amb.refCode }],
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma error in getAmbassadorReferredBookings', e);
    }
  }

  const store = loadFallbackStore();
  return (store.ticketBookings || [])
    .filter((b) => b.referredByAmbassadorId === amb.id || b.referredByAmbassadorId === amb.refCode)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
