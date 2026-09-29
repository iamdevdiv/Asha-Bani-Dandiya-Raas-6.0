import { redirect } from 'next/navigation';
import { getVerifierSession } from '@/lib/verifier-auth';
import VerifierLoginClient from './VerifierLoginClient';

export const metadata = {
  title: 'Gate Verifier Login | Asha Bani Dandiya Raas 2026',
};

export default async function VerifierLoginPage() {
  const session = await getVerifierSession();
  if (session) {
    redirect('/verifier/scan');
  }

  return <VerifierLoginClient />;
}
