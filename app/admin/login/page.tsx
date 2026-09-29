import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminLoginClient from './AdminLoginClient';

export const metadata = {
  title: 'Admin Login | Asha Bani Dandiya Raas 2026',
};

export default async function AdminLoginPage() {
  const admin = await getAdminSession();
  if (admin) {
    redirect('/admin/ticket-bookings');
  }

  return <AdminLoginClient />;
}
