'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STATIC_TITLES: Record<string, string> = {
  '/': 'Asha Bani Dandiya Raas 2026 | 6th Grand Dandiya Celebration',
  '/dandiyaraas': 'Asha Bani Dandiya Raas 2026 | 6th Grand Dandiya Celebration',
  '/dandiyaraas/tickets/buy': 'Buy Festival Passes & Tickets | Asha Bani Dandiya Raas 2026',
  '/dandiyaraas/stall': 'Book Commercial & Food Stalls | Asha Bani Dandiya Raas 2026',
  '/dandiyaraas/stall/book': 'Reserve Canopy Stall | Asha Bani Dandiya Raas 2026',
  '/dandiyaraas/stall/success': 'Official Exhibitor Stall Pass & Settlements | Asha Bani Dandiya Raas 2026',
  '/contact': 'Contact & Festival Helpline | Asha Bani Dandiya Raas 2026',
  '/privacy-policy': 'Privacy Policy | Asha Bani Dandiya Raas 2026',
  '/terms-and-conditions': 'Terms & Conditions | Asha Bani Dandiya Raas 2026',
  '/refund-policy': 'Cancellation & Refund Policy | Asha Bani Dandiya Raas 2026',
  '/ambassador/apply': 'Campus Ambassador Registration | Asha Bani Dandiya Raas 2026',
  '/ambassador/login': 'Campus Ambassador Portal Login | Asha Bani Dandiya Raas 2026',
  '/ambassador/dashboard': 'Campus Ambassador Dashboard | Asha Bani Dandiya Raas 2026',
  '/verifier/login': 'Gate Verifier Login | Asha Bani Dandiya Raas 2026',
  '/verifier/scan': 'Gate Verification Scanner | Asha Bani Dandiya Raas 2026',
  '/admin/login': 'Admin Login | Asha Bani Dandiya Raas 2026',
  '/admin': 'Ticket Bookings Management | Asha Bani Admin',
  '/admin/ticket-bookings': 'Ticket Bookings Management | Asha Bani Admin',
  '/admin/ticket-phases': 'Ticket Phases & Pricing Setup | Asha Bani Admin',
  '/admin/coupons': 'Coupons & Promo Codes Management | Asha Bani Admin',
  '/admin/bookings': 'Stall Bookings & Exhibitor Passes | Asha Bani Admin',
  '/admin/stalls': 'Stall Management & Layout | Asha Bani Admin',
  '/admin/stall-vouchers': 'Stall Voucher Earnings & Settlements | Asha Bani Admin',
  '/admin/ambassadors': 'Campus Ambassadors & Rewards | Asha Bani Admin',
  '/admin/inquiries': 'Customer Inquiries & Support Leads | Asha Bani Admin',
  '/admin/media': 'Media Library & Banner Assets | Asha Bani Admin',
  '/admin/users': 'Admin Users & Gate Staff Roles | Asha Bani Admin',
  '/admin/settings': 'Global Event Settings & Rules | Asha Bani Admin',
  '/admin/security': 'Security & Admin Password | Asha Bani Admin',
};

function resolveTitleForPath(pathname: string): string {
  if (STATIC_TITLES[pathname]) {
    return STATIC_TITLES[pathname];
  }

  // Dynamic route patterns
  if (pathname.startsWith('/dandiyaraas/tickets/pass/')) {
    return 'Official Digital Festival Pass | Asha Bani Dandiya Raas 2026';
  }
  if (pathname.startsWith('/dandiyaraas/tickets/voucher/')) {
    return 'Festival Food & Shopping Voucher Wallet | Asha Bani Dandiya Raas 2026';
  }
  if (pathname.startsWith('/dandiyaraas/stall/pass/')) {
    return 'Official Exhibitor Stall Pass & Settlements | Asha Bani Dandiya Raas 2026';
  }

  return 'Asha Bani Dandiya Raas 2026 | 6th Grand Dandiya Celebration';
}

export function PageTitleListener() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targetTitle = resolveTitleForPath(pathname);
    document.title = targetTitle;

    // Observe document.title to prevent Next.js layout metadata from resetting it
    const titleElem = document.querySelector('title');
    if (!titleElem) return;

    const observer = new MutationObserver(() => {
      if (document.title !== targetTitle) {
        document.title = targetTitle;
      }
    });

    observer.observe(titleElem, { subtree: true, characterData: true, childList: true });

    // Double-check on next animation frame
    const timer = setTimeout(() => {
      if (document.title !== targetTitle) {
        document.title = targetTitle;
      }
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
