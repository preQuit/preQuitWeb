'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Spinner } from '../components/Spinner';
import { useSession } from '../hooks/useSession';
import { ROUTES } from '../navigation/routes';

interface DetailRowProps {
  readonly label: string;
  readonly value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex items-center gap-4 px-4 py-4">
    <span className="flex-1 text-[15px] text-paper">{label}</span>
    <span className="truncate text-sm text-muted">{value}</span>
  </div>
);

export const SettingsScreen = () => {
  const router = useRouter();
  const { user, signOut } = useSession();
  const [confirming, setConfirming] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.replace(ROUTES.SPLASH);
  };

  return (
    <main className="flex flex-col">
      <ScreenHeader title="Settings" backHref={ROUTES.PROFILE} />

      <section className="flex flex-col gap-2.5 px-5 pt-2">
        <SectionLabel>Account</SectionLabel>
        <div className="glass divide-y divide-white/10 overflow-hidden rounded-2xl">
          <DetailRow label="Username" value={user?.handle ? `@${user.handle}` : '—'} />
          <DetailRow label="Email" value={user?.email ?? '—'} />
          <DetailRow label="Email verified" value={user?.emailVerified ? 'Yes' : 'Not yet'} />
        </div>
      </section>

      <section className="mt-7 flex flex-col gap-2.5 px-5">
        <SectionLabel>Session</SectionLabel>
        <div className="glass overflow-hidden rounded-2xl">
          {confirming ? (
            <div className="flex flex-col gap-3.5 px-4 py-4">
              <p className="text-sm leading-5 text-paper">
                You will need to sign in again to use PreQuit.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={isSigningOut}
                  className="glass-subtle flex-1 rounded-xl py-2.5 text-sm font-semibold text-paper"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSignOut}
                  disabled={isSigningOut}
                  className="flex flex-1 items-center justify-center rounded-xl bg-danger py-2.5 text-sm font-bold text-paper disabled:opacity-60"
                >
                  {isSigningOut ? <Spinner size="sm" /> : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="w-full px-4 py-4 text-left text-[15px] font-semibold text-danger transition-colors hover:bg-white/5"
            >
              Sign out
            </button>
          )}
        </div>
      </section>
    </main>
  );
};
