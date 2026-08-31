export interface StallDef {
  stallNumber: string;
  section: 'food' | 'turning_premium' | 'front_visibility' | 'outstanding_visibility';
  sectionLabel: string;
  defaultPrice: number;
  row: number;
  col: number;
  description: string;
}

// 7 rows x 5 columns grid matching reference/5.png
export const INITIAL_STALLS: StallDef[] = [
  // Row 1: 1, 2, 3, 4, 5
  { stallNumber: '1', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 1, col: 1, description: 'Food Stall near Main Pathway' },
  { stallNumber: '2', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 1, col: 2, description: 'Food Stall with High Footfall' },
  { stallNumber: '3', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 1, col: 3, description: 'Central Food Zone Stall' },
  { stallNumber: '4', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 1, col: 4, description: 'Food Zone Corner Stall' },
  { stallNumber: '5', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 1, col: 5, description: 'Upper Food Zone Stall' },

  // Row 2: 6, 7, 8, 9, 10
  { stallNumber: '6', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 2, col: 1, description: 'Food Zone Midline Stall' },
  { stallNumber: '7', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 2, col: 2, description: 'Central Food Court Stall' },
  { stallNumber: '8', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 2, col: 3, description: 'Food Court Aisle Stall' },
  { stallNumber: '9', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 2, col: 4, description: 'Food Zone Entry Facing Stall' },
  { stallNumber: '10', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 2, col: 5, description: 'Spacious Food Stall' },

  // Row 3: 11, 12, 13, 14, 15
  { stallNumber: '11', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 3, col: 1, description: 'Food Stall with Excellent Ventilation' },
  { stallNumber: '12', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 3, col: 2, description: 'Food Stall near Dining Area' },
  { stallNumber: '13', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 3, col: 3, description: 'Prime Food Showcase Stall' },
  { stallNumber: '14', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 3, col: 4, description: 'Wide Angle Food Stall' },
  { stallNumber: '15', section: 'food', sectionLabel: 'Food Stall', defaultPrice: 3500, row: 3, col: 5, description: 'End-line Food Stall' },

  // Row 4: A, B, C, D, E
  { stallNumber: 'A', section: 'turning_premium', sectionLabel: 'Turning Premium Location', defaultPrice: 4500, row: 4, col: 1, description: 'Entrance Gate Facing Stall A' },
  { stallNumber: 'B', section: 'turning_premium', sectionLabel: 'Turning Premium Location', defaultPrice: 4500, row: 4, col: 2, description: 'Entrance Gate Facing Stall B' },
  { stallNumber: 'C', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 4, col: 3, description: 'Main Corridor Commercial Stall C' },
  { stallNumber: 'D', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 4, col: 4, description: 'Main Corridor Commercial Stall D' },
  { stallNumber: 'E', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 4, col: 5, description: 'Main Corridor Commercial Stall E' },

  // Row 5: F, G, H, I, J
  { stallNumber: 'F', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 5, col: 1, description: 'Commercial Aisle Stall F' },
  { stallNumber: 'G', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 5, col: 2, description: 'Commercial Aisle Stall G' },
  { stallNumber: 'H', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 5, col: 3, description: 'Commercial Aisle Stall H' },
  { stallNumber: 'I', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 5, col: 4, description: 'Commercial Aisle Stall I' },
  { stallNumber: 'J', section: 'outstanding_visibility', sectionLabel: 'Outstanding Visibility', defaultPrice: 3500, row: 5, col: 5, description: 'Commercial Corner Stall J' },

  // Row 6: K, L, M, N, O
  { stallNumber: 'K', section: 'front_visibility', sectionLabel: 'Front Visibility (Prime)', defaultPrice: 5500, row: 6, col: 1, description: 'Super-Prime Front Visibility Stall K' },
  { stallNumber: 'L', section: 'front_visibility', sectionLabel: 'Front Visibility (Prime)', defaultPrice: 5500, row: 6, col: 2, description: 'Super-Prime Front Visibility Stall L' },
  { stallNumber: 'M', section: 'front_visibility', sectionLabel: 'Front Visibility (Prime)', defaultPrice: 5500, row: 6, col: 3, description: 'Super-Prime Front Visibility Stall M' },
  { stallNumber: 'N', section: 'front_visibility', sectionLabel: 'Front Visibility (Prime)', defaultPrice: 5500, row: 6, col: 4, description: 'Super-Prime Front Visibility Stall N' },
  { stallNumber: 'O', section: 'front_visibility', sectionLabel: 'Front Visibility (Prime)', defaultPrice: 5500, row: 6, col: 5, description: 'Super-Prime Front Visibility Stall O' },

  // Row 7: P, Q, R, S, T
  { stallNumber: 'P', section: 'front_visibility', sectionLabel: 'Front Visibility (Prime)', defaultPrice: 5500, row: 7, col: 1, description: 'Super-Prime Front Visibility Stall P' },
  { stallNumber: 'Q', section: 'turning_premium', sectionLabel: 'Turning Premium Location', defaultPrice: 4500, row: 7, col: 2, description: 'High-Density Turning Point Stall Q' },
  { stallNumber: 'R', section: 'turning_premium', sectionLabel: 'Turning Premium Location', defaultPrice: 4500, row: 7, col: 3, description: 'High-Density Turning Point Stall R' },
  { stallNumber: 'S', section: 'turning_premium', sectionLabel: 'Turning Premium Location', defaultPrice: 4500, row: 7, col: 4, description: 'Grand Corner Turning Stall S' },
  { stallNumber: 'T', section: 'turning_premium', sectionLabel: 'Turning Premium Location', defaultPrice: 4500, row: 7, col: 5, description: 'Grand Corner Turning Stall T' },
];

export const INITIAL_CAROUSEL_IMAGES = [
  { id: '1', imageUrl: '/images/carousel/1U5A0764.JPG', title: 'Traditional Garba Circles & Festive Joy', displayOrder: 1, isActive: true },
  { id: '2', imageUrl: '/images/carousel/1U5A0765.JPG', title: 'Vibrant Dandiya Raas Evening', displayOrder: 2, isActive: true },
  { id: '3', imageUrl: '/images/carousel/1U5A0766.JPG', title: 'Festive Chaniya Choli & Traditional Attire', displayOrder: 3, isActive: true },
  { id: '4', imageUrl: '/images/carousel/1U5A0767.JPG', title: 'Live Dhol Beats & Energetic Rhythm', displayOrder: 4, isActive: true },
  { id: '5', imageUrl: '/images/carousel/1U5A0768.JPG', title: 'Community Celebration & Joyful Families', displayOrder: 5, isActive: true },
  { id: '6', imageUrl: '/images/carousel/1U5A0770.JPG', title: 'Grand Dandiya Raas Dance Floor', displayOrder: 6, isActive: true },
  { id: '7', imageUrl: '/images/carousel/1U5A0771.JPG', title: 'Exhibitor Canopies & Food Stalls', displayOrder: 7, isActive: true },
  { id: '8', imageUrl: '/images/carousel/1U5A0772.JPG', title: 'Festive Smiles & Dandiya Sticks', displayOrder: 8, isActive: true },
  { id: '9', imageUrl: '/images/carousel/1U5A0773.JPG', title: 'Celebration of Navratri Culture', displayOrder: 9, isActive: true },
  { id: '10', imageUrl: '/images/carousel/1U5A0774.JPG', title: 'Youth & Family Garba Groups', displayOrder: 10, isActive: true },
  { id: '11', imageUrl: '/images/carousel/1U5A0775.JPG', title: 'Illuminated Stage & Musical Atmosphere', displayOrder: 11, isActive: true },
  { id: '12', imageUrl: '/images/carousel/1U5A0776.JPG', title: 'Colorful Traditional Turbans & Dupattas', displayOrder: 12, isActive: true },
  { id: '13', imageUrl: '/images/carousel/1U5A0777.JPG', title: 'Dandiya Raas Festivities in Full Swing', displayOrder: 13, isActive: true },
  { id: '14', imageUrl: '/images/carousel/1U5A0778.JPG', title: 'Enthusiastic Crowd & Cheerful Beats', displayOrder: 14, isActive: true },
  { id: '15', imageUrl: '/images/carousel/1U5A0779.JPG', title: 'Traditional Jewellery & Festive Glamour', displayOrder: 15, isActive: true },
  { id: '16', imageUrl: '/images/carousel/1U5A0780.JPG', title: 'Family Togetherness at Asha Bani Dandiya', displayOrder: 16, isActive: true },
  { id: '17', imageUrl: '/images/carousel/1U5A0781.JPG', title: 'Vibrant Stage Lighting & Performers', displayOrder: 17, isActive: true },
  { id: '18', imageUrl: '/images/carousel/1U5A0784.JPG', title: 'Grand Garba Raas Choreography', displayOrder: 18, isActive: true },
  { id: '19', imageUrl: '/images/carousel/1U5A0785.JPG', title: 'Festive Shopping & Stall Experience', displayOrder: 19, isActive: true },
  { id: '20', imageUrl: '/images/carousel/1U5A0786.JPG', title: 'Live Orchestra & Navratri Melodies', displayOrder: 20, isActive: true },
  { id: '21', imageUrl: '/images/carousel/1U5A0787.JPG', title: 'Cheerful Dandiya Clashing Moments', displayOrder: 21, isActive: true },
  { id: '22', imageUrl: '/images/carousel/1U5A0788.JPG', title: 'Grand Aarti & Auspicious Blessings', displayOrder: 22, isActive: true },
  { id: '23', imageUrl: '/images/carousel/1U5A0789.JPG', title: 'Memorable Moments & Photo Booth Smiles', displayOrder: 23, isActive: true },
  { id: '24', imageUrl: '/images/carousel/1U5A0790.JPG', title: 'Spectacular Night of Music and Rhythm', displayOrder: 24, isActive: true },
  { id: '25', imageUrl: '/images/carousel/1U5A0792.JPG', title: 'Grand Finale of Joy and Togetherness', displayOrder: 25, isActive: true },
];

export const INITIAL_TICKET_PHASES = [
  {
    id: 'phase_1',
    phaseNumber: 1,
    name: 'Phase 1 - Early Bird',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    adultPrice: 499,
    childPrice: 199,
    voucherAmount: 100,
    voucherApplicableTo: 'both',
    isActive: true,
  },
  {
    id: 'phase_2',
    phaseNumber: 2,
    name: 'Phase 2 - Regular',
    startDate: '2026-09-11',
    endDate: '2026-09-20',
    adultPrice: 599,
    childPrice: 199,
    voucherAmount: 100,
    voucherApplicableTo: 'both',
    isActive: true,
  },
  {
    id: 'phase_3',
    phaseNumber: 3,
    name: 'Phase 3 - Grand Finale',
    startDate: '2026-09-21',
    endDate: '2026-10-13',
    adultPrice: 699,
    childPrice: 199,
    voucherAmount: 100,
    voucherApplicableTo: 'both',
    isActive: true,
  },
];

export const INITIAL_AMBASSADOR_TIERS = [
  {
    id: 'tier_1',
    tierLevel: 1,
    name: 'Tier 1 - Silver Ambassador',
    referralsRequired: 10,
    voucherAmount: 500,
    voucherApplicableTo: 'both',
    grantsFreeTicket: true,
    isActive: true,
  },
  {
    id: 'tier_2',
    tierLevel: 2,
    name: 'Tier 2 - Gold Ambassador',
    referralsRequired: 25,
    voucherAmount: 1000,
    voucherApplicableTo: 'both',
    grantsFreeTicket: true,
    isActive: true,
  },
];

export interface CouponDef {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 100 for 100%, or 200 for ₹200
  maxUses: number | null;
  usedCount: number;
  minOrderAmount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_COUPONS: CouponDef[] = [
  {
    id: 'coupon_testpass',
    code: 'TESTPASS2026',
    description: 'Admin 100% Test Pass Voucher',
    discountType: 'percentage',
    discountValue: 100,
    maxUses: null,
    usedCount: 0,
    minOrderAmount: 0,
    expiresAt: null,
    isActive: true,
  },
  {
    id: 'coupon_festive10',
    code: 'FESTIVE10',
    description: '10% Festive Season Discount',
    discountType: 'percentage',
    discountValue: 10,
    maxUses: 200,
    usedCount: 0,
    minOrderAmount: 400,
    expiresAt: '2026-10-15',
    isActive: true,
  },
];

export const DEFAULT_SETTINGS = {
  ticket_booking_start_date: '2026-09-01',
  ticket_booking_start_time: '00:00',
  ticket_booking_msg: 'Ticket bookings start from 1 September 2026',
  max_children_per_ticket: '3',
  child_height_limit_inches: '55',
  event_name: 'Asha Bani Dandiya Raas 6.0',
  event_edition: '6th Grand Dandiya Celebration',
  event_tagline: '6 Years of Joy, Music & Togetherness',
  event_date: '13 October 2026',
  event_time: '6:00 PM to 12:00 AM',
  stall_setup_time: '4:00 PM',
  contact_phone: '+91 6399063455',
  contact_email: 'contact@ashabani.com',
  venue_name: 'Maharaja Agrasen Bhavan',
  venue_address: 'Aggarwal Dharamshala, Saharanpur',
  instagram_url: 'https://www.instagram.com/asha_bani_dandiya_raas_6.0',
  hero_title_prefix: 'ASHA BANI DANDIYA RAAS PRESENTS',
  hero_title_main: '6th Grand Dandiya Celebration',
  hero_title_sub: '6 Years of Joy, Music & Togetherness',
  ticket_voucher_applicable_to: 'both',
};

export function isFoodStall(stallNumber: string): boolean {
  const clean = String(stallNumber || '').toUpperCase().replace(/^STALL\s*/i, '').trim();
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 15) return true;
  const def = INITIAL_STALLS.find((s) => s.stallNumber.toUpperCase() === clean);
  return def ? def.section === 'food' : false;
}

export function isCommercialStall(stallNumber: string): boolean {
  return !isFoodStall(stallNumber);
}

export function getStallCategoryLabel(stallNumber: string): string {
  return isFoodStall(stallNumber) ? 'Food Stall (Stalls 1–15)' : 'Commercial & Shopping Stall (Stalls A–T)';
}
