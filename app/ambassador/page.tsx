import { redirect } from 'next/navigation';
import { getAmbassadorSession } from '@/lib/ambassador-auth';

export default async function AmbassadorRootPage() {
  const session = await getAmbassadorSession();
  if (!session) {
    redirect('/ambassador/login');
  }
  redirect('/ambassador/dashboard');
}
