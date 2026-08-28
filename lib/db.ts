import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { INITIAL_STALLS, INITIAL_CAROUSEL_IMAGES, DEFAULT_SETTINGS, StallDef } from './stall-data';

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

  const stalls = INITIAL_STALLS.map((s, idx) => ({
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
    } catch (e) {
      console.warn('Prisma error in updateSetting', e);
    }
  }
  const store = loadFallbackStore();
  store.settings[key] = value;
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
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { bookingNumber: { equals: query, mode: 'insensitive' } },
            { id: query },
            { stallNumber: query },
            { stallNumber: cleanStall },
          ],
        },
      });

      if (!booking) {
        return { success: false, message: `Invalid QR pass. No booking found matching "${query}".` };
      }

      if (booking.isCheckedIn) {
        return {
          success: true,
          alreadyCheckedIn: true,
          booking,
          message: 'DUPLICATE ENTRY ALERT: This pass has already been scanned!',
          checkedInAt: booking.checkedInAt,
          checkedInBy: booking.checkedInBy || 'Gate Verifier',
        };
      }

      const now = new Date();
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          isCheckedIn: true,
          checkedInAt: now,
          checkedInBy: verifierName,
        },
      });

      // Also update stall status
      await prisma.stall.updateMany({
        where: { stallNumber: booking.stallNumber },
        data: {
          isCheckedIn: true,
          checkedInAt: now,
        },
      });

      return {
        success: true,
        alreadyCheckedIn: false,
        booking: updated,
        message: 'PASS VERIFIED: Entry Approved',
      };
    } catch (e) {
      console.warn('Prisma error in verifyAndCheckInBooking', e);
    }
  }

  const store = loadFallbackStore();
  const booking = store.bookings.find(
    (b) =>
      b.bookingNumber?.toLowerCase() === query.toLowerCase() ||
      b.id?.toLowerCase() === query.toLowerCase() ||
      b.stallNumber?.toLowerCase() === query.toLowerCase() ||
      b.stallNumber?.toLowerCase() === cleanStall.toLowerCase()
  );

  if (!booking) {
    return { success: false, message: `Invalid QR pass. No booking found matching "${query}".` };
  }

  if (booking.isCheckedIn) {
    return {
      success: true,
      alreadyCheckedIn: true,
      booking,
      message: 'DUPLICATE ENTRY ALERT: This pass has already been scanned!',
      checkedInAt: booking.checkedInAt,
      checkedInBy: booking.checkedInBy || 'Gate Verifier',
    };
  }

  const nowIso = new Date().toISOString();
  booking.isCheckedIn = true;
  booking.checkedInAt = nowIso;
  booking.checkedInBy = verifierName;

  // Also update corresponding stall
  const stall = store.stalls.find((s) => s.stallNumber.toUpperCase() === booking.stallNumber.toUpperCase());
  if (stall) {
    stall.isCheckedIn = true;
    stall.checkedInAt = nowIso;
  }

  saveFallbackStore(store);

  return {
    success: true,
    alreadyCheckedIn: false,
    booking,
    message: 'PASS VERIFIED: Entry Approved',
  };
}
