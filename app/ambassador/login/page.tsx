import { redirect } from 'next/navigation';
import { getAmbassadorSession } from '@/lib/ambassador-auth';
import AmbassadorLoginClient from './AmbassadorLoginClient';

export const metadata = {
  title: 'Ambassador Login | Asha Bani Dandiya Raas 2026',
};

export default async function AmbassadorLoginPage() {
  const session = await getAmbassadorSession();
  if (session) {
    redirect('/ambassador/dashboard');
  }

  return <AmbassadorLoginClient />;
}
