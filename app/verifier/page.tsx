import { redirect } from 'next/navigation';
import { getVerifierSession } from '@/lib/verifier-auth';

export default async function VerifierRootPage() {
  const session = await getVerifierSession();
  if (!session) {
    redirect('/verifier/login');
  }
  redirect('/verifier/scan');
}
