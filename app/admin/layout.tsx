import React from 'react';
import { AdminLayoutWrapper } from '@/components/AdminLayoutWrapper';

export const metadata = {
  title: {
    default: 'Admin Portal | Asha Bani Dandiya Raas 2026',
    template: '%s | Asha Bani Admin',
  },
  description: 'Manage stall layouts, pricing, bookings, and website content.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
