'use client';

import { Lock, User2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { PostAudience } from '../../domain/entities/User';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Spinner } from '../components/Spinner';
import { useMyProfile } from '../hooks/useProfile';
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

interface ToggleProps {
  readonly checked: boolean;
  readonly disabled?: boolean;
  onChange(next: boolean): void;
}

const Toggle = ({ checked, disabled, onChange }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
      checked ? 'border-cobalt bg-cobalt' : 'border-line-strong bg-surface-strong'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-paper transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const AUDIENCE_OPTIONS: ReadonlyArray<{ value: PostAudience; label: string }> = [
  { value: 'followers', label: 'Followers' },
  { value: 'everyone', label: 'Everyone' },
];

interface AudienceRowProps {
  readonly label: string;
  readonly value: PostAudience;
  readonly disabled: boolean;
  onChange(next: PostAudience): void;
}

const AudienceRow = ({ label, value, disabled, onChange }: AudienceRowProps) => (
  <div className="flex flex-col gap-2.5 px-4 py-4">
    <span className="text-[14px] text-paper">{label}</span>
    <div className="surface-subtle flex rounded-xl p-1">
      {AUDIENCE_OPTIONS.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-50 ${
              active ? 'bg-cobalt text-paper' : 'text-muted hover:text-paper'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

const PRIVACY_COPY = {
  private: {
    title: 'Go private?',
    body: 'Only people who already follow you keep seeing your posts. Everyone else has to send a follow request.',
    confirmLabel: 'Go private',
  },
  public: {
    title: 'Go public?',
    body: 'Anyone on PreQuit will be able to find your profile and read every post you have published.',
    confirmLabel: 'Go public',
  },
} as const;

export const SettingsScreen = () => {
  const router = useRouter();
  const { user, signOut } = useSession();
  const { profile, isLoading, isSavingPrivacy, privacyError, setAccountPrivate, updatePrivacy } =
    useMyProfile();
  const [confirming, setConfirming] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [privacyConfirmOpen, setPrivacyConfirmOpen] = useState(false);

  const isPrivate = Boolean(profile?.isPrivate);
  const privacy = profile?.privacy;
  const target = isPrivate ? 'public' : 'private';
  const copy = PRIVACY_COPY[target];

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.replace(ROUTES.SPLASH);
  };

  const confirmToggle = async () => {
    const saved = await setAccountPrivate(!isPrivate);
    if (saved) setPrivacyConfirmOpen(false);
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col"
    >
      <ScreenHeader title="Settings" backHref={ROUTES.PROFILE} />

      <section className="flex flex-col gap-2.5 px-5 pt-2">
        <SectionLabel>Account</SectionLabel>
        <div className="surface divide-y divide-line overflow-hidden rounded-2xl">
          <DetailRow label="Username" value={user?.handle ? `@${user.handle}` : '—'} />
          <DetailRow label="Email" value={user?.email ?? '—'} />
          <DetailRow label="Email verified" value={user?.emailVerified ? 'Yes' : 'Not yet'} />
        </div>
      </section>

      <section className="mt-7 flex flex-col gap-2.5 px-5">
        <SectionLabel>Account privacy</SectionLabel>
        <div className="surface overflow-hidden rounded-2xl">
          <button
            type="button"
            onClick={() => setPrivacyConfirmOpen(true)}
            disabled={isLoading}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cobalt/10 disabled:opacity-60"
          >
            {isPrivate ? <Lock size={16} className="text-paper" /> : <User2 size={16} className="text-paper" />}
            <span className="flex-1 text-[15px] text-paper">
              {isPrivate ? 'Private account' : 'Public account'}
            </span>
            {isLoading ? <Spinner size="sm" /> : <span className="text-sm font-semibold text-cobalt-bright">Switch</span>}
          </button>
        </div>
        <p className="px-1 text-[12px] text-muted">
          {isPrivate
            ? 'Only approved followers can see what you post.'
            : 'Anyone on PreQuit can see what you post.'}
        </p>
      </section>

      <section className="mt-7 flex flex-col gap-2.5 px-5">
        <div className="flex items-center justify-between">
          <SectionLabel>Private account</SectionLabel>
          {isPrivate ? (
            <span className="rounded-full bg-cobalt/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-cobalt-bright">
              ACTIVE
            </span>
          ) : null}
        </div>
        <div className={`surface divide-y divide-line overflow-hidden rounded-2xl ${isPrivate ? '' : 'opacity-60'}`}>
          <AudienceRow
            label="Who can view and interact with my posts"
            value={privacy?.whoCanViewPosts ?? 'everyone'}
            disabled={isSavingPrivacy}
            onChange={next => void updatePrivacy({ whoCanViewPosts: next })}
          />
          <div className="flex items-center gap-4 px-4 py-4">
            <span className="flex-1 text-[14px] text-paper">Let non-followers request to message me</span>
            <Toggle
              checked={privacy?.allowMessageRequests ?? true}
              disabled={isSavingPrivacy}
              onChange={next => void updatePrivacy({ allowMessageRequests: next })}
            />
          </div>
        </div>
      </section>

      <section className="mt-7 flex flex-col gap-2.5 px-5">
        <div className="flex items-center justify-between">
          <SectionLabel>Public account</SectionLabel>
          {isPrivate ? null : (
            <span className="rounded-full bg-cobalt/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-cobalt-bright">
              ACTIVE
            </span>
          )}
        </div>
        <div className={`surface divide-y divide-line overflow-hidden rounded-2xl ${isPrivate ? 'opacity-60' : ''}`}>
          <AudienceRow
            label="Who can message me"
            value={privacy?.whoCanMessage ?? 'followers'}
            disabled={isSavingPrivacy}
            onChange={next => void updatePrivacy({ whoCanMessage: next })}
          />
          <div className="flex items-center gap-4 px-4 py-4">
            <span className="flex-1 text-[14px] text-paper">Show my activity status</span>
            <Toggle
              checked={privacy?.showActivityStatus ?? true}
              disabled={isSavingPrivacy}
              onChange={next => void updatePrivacy({ showActivityStatus: next })}
            />
          </div>
        </div>
        <p className="px-1 text-[12px] text-muted">
          These preferences are kept whichever mode your account is in.
        </p>
      </section>

      {privacyError ? (
        <section className="mt-5 px-5">
          <p className="text-[12px] text-danger">{privacyError}</p>
        </section>
      ) : null}

      <section className="mt-7 flex flex-col gap-2.5 px-5">
        <SectionLabel>Session</SectionLabel>
        <div className="surface overflow-hidden rounded-2xl">
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
                  className="surface-subtle flex-1 rounded-xl py-2.5 text-sm font-semibold text-paper"
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
              className="w-full px-4 py-4 text-left text-[15px] font-semibold text-danger transition-colors hover:bg-danger/10"
            >
              Sign out
            </button>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={privacyConfirmOpen}
        title={copy.title}
        body={privacyError ?? copy.body}
        confirmLabel={copy.confirmLabel}
        busyLabel="Saving…"
        cancelLabel="Not yet"
        imageSrc="/omniman.gif"
        imageAlt=""
        destructive={false}
        busy={isSavingPrivacy}
        onConfirm={confirmToggle}
        onCancel={() => setPrivacyConfirmOpen(false)}
      />
    </main>
  );
};
