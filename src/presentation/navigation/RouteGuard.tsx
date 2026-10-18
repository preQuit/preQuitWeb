'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { Spinner } from '../components/Spinner';
import { useSession } from '../hooks/useSession';
import { ROUTES } from './routes';

const Restoring = () => (
  <div className="flex min-h-dvh items-center justify-center">
    <Spinner />
  </div>
);

export interface RouteGuardProps {
  readonly children: ReactNode;
}

export const RequireSession = ({ children }: RouteGuardProps) => {
  const router = useRouter();
  const { isRestoring, isSignedIn } = useSession();

  useEffect(() => {
    if (!isRestoring && !isSignedIn) router.replace(ROUTES.SPLASH);
  }, [isRestoring, isSignedIn, router]);

  if (isRestoring || !isSignedIn) return <Restoring />;
  return <>{children}</>;
};

/**
 * True only while the viewer is actually being sent to the app. Restoring on its
 * own does not count: a guest screen must stay usable even if the session probe
 * is slow or never settles, otherwise the page becomes a dead end with no way in.
 */
export const useRedirectWhenSignedIn = (): boolean => {
  const router = useRouter();
  const { isRestoring, isSignedIn } = useSession();

  useEffect(() => {
    if (!isRestoring && isSignedIn) router.replace(ROUTES.HOME);
  }, [isRestoring, isSignedIn, router]);

  return isSignedIn;
};

export const RequireGuest = ({ children }: RouteGuardProps) => {
  const settling = useRedirectWhenSignedIn();
  if (settling) return <Restoring />;
  return <>{children}</>;
};
