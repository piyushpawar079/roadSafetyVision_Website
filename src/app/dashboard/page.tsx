// ===========================================
// DASHBOARD REDIRECT PAGE
// Redirects users to their role-specific dashboard
// ===========================================

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/auth/login');
      return;
    }

    if (session?.user?.role) {
      // Redirect based on user role
      switch (session.user.role) {
        case 'super_admin':
          router.replace('/dashboard/super-admin');
          break;
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        case 'citizen':
        default:
          router.replace('/dashboard/citizen');
          break;
      }
    }
  }, [session, status, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" text="Redirecting to your dashboard..." />
    </div>
  );
}