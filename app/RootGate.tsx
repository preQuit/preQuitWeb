'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Spinner } from '@/src/presentation/components/Spinner';
import { useSession } from '@/src/presentation/hooks/useSession';
import { ROUTES } from '@/src/presentation/navigation/routes';

/**
 * `/` is a gate, not a page — it never renders a form of its own, only
 * decides where the visitor belongs once the session probe settles.
 */
export const RootGate = () => {
  const router = useRouter();
  const { isRestoring, isSignedIn } = useSession();

  useEffect(() => {
    if (isRestoring) return;
    router.replace(isSignedIn ? ROUTES.FEED : ROUTES.SIGN_IN);
  }, [isRestoring, isSignedIn, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner />
    </div>
  );
};
