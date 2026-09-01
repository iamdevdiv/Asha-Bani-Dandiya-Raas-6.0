import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export default async function AdminRootPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect('/admin/login');
  }
  redirect('/admin/ticket-bookings');
}

