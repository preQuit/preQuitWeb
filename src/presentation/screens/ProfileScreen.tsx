'use client';

import { Heart, ImageOff, Inbox, Lock, Pencil, RefreshCw, ShieldOff, User2, UserX } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Post } from '../../domain/entities/Post';
import { initialOf } from '../../domain/entities/User';
import { messageOf } from '../../domain/errors/AppError';
import { CommentSheet } from '../components/CommentSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Spinner } from '../components/Spinner';
import { formatCount } from '../format';
import { useMyProfile } from '../hooks/useProfile';
import { ROUTES } from '../navigation/routes';
import { SOCIAL_GRAPH_ROUTES } from '../navigation/socialRoutes';

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

interface StatProps {
  readonly value: number;
  readonly label: string;
}

const Stat = ({ value, label }: StatProps) => (
  <div className="flex flex-1 flex-col items-center gap-1">
    <span className="text-lg font-bold text-paper">{formatCount(value)}</span>
    <span className="text-[11px] font-medium text-muted">{label}</span>
  </div>
);

interface StatLinkProps extends StatProps {
  readonly href: string;
}

const StatLink = ({ value, label, href }: StatLinkProps) => (
  <Link href={href} className="flex flex-1 flex-col items-center gap-1">
    <span className="text-lg font-bold text-paper">{formatCount(value)}</span>
    <span className="text-[11px] font-medium text-muted">{label}</span>
  </Link>
);

interface SocialLinkProps {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly href: string;
}

const SocialLink = ({ icon: Icon, label, href }: SocialLinkProps) => (
  <Link
    href={href}
    className="surface flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 text-paper transition-colors hover:bg-cobalt/15"
  >
    <Icon size={17} />
    <span className="text-[11px] font-semibold">{label}</span>
  </Link>
);

const ProfileShell = ({
  children,
  actions,
}: {
  readonly children: ReactNode;
  readonly actions?: ReactNode;
}) => (
  <main
    id="main-content"
    tabIndex={-1}
    className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col"
  >
    <ScreenHeader title="Profile" actions={actions} />
    {children}
  </main>
);

export const ProfileScreen = () => {
  const {
    profile,
    posts,
    isLoading,
    isRefreshing,
    error,
    refresh,
    deletePost,
    isSavingPrivacy,
    privacyError,
    setAccountPrivate,
  } = useMyProfile();
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <ProfileShell>
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner />
        </div>
      </ProfileShell>
    );
  }

  if (!profile) {
    return (
      <ProfileShell>
        <EmptyState icon={UserX} title="Profile unavailable" body={messageOf(error, 'Could not load your profile')} />
      </ProfileShell>
    );
  }

  const target = profile.isPrivate ? 'public' : 'private';
  const copy = PRIVACY_COPY[target];

  const confirmToggle = async () => {
    const saved = await setAccountPrivate(!profile.isPrivate);
    if (saved) setConfirmOpen(false);
  };

  return (
    <ProfileShell
      actions={
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label={profile.isPrivate ? 'Private account. Switch to public.' : 'Public account. Switch to private.'}
          className="surface flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-paper transition-colors hover:bg-cobalt/15"
        >
          {profile.isPrivate ? <Lock size={14} /> : <User2 size={14} />}
          {profile.isPrivate ? 'Private' : 'Public'}
        </button>
      }
    >
      <section className="flex flex-col items-center px-6">
        <span className="surface-raised flex size-30 items-center justify-center rounded-full text-5xl font-extrabold text-paper shadow-[0_0_48px_rgb(var(--cobalt-rgb)/0.45)]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="size-full rounded-full object-cover"
            />
          ) : (
            initialOf(profile)
          )}
        </span>

        <h1 className="mt-4 text-2xl font-bold text-paper">{profile.displayName}</h1>
        <p className="mt-0.5 text-sm font-medium text-muted">@{profile.handle}</p>
        {profile.bio ? (
          <p className="mt-1.5 max-w-sm text-center text-[13px] leading-5 text-paper">
            {profile.bio}
          </p>
        ) : null}
      </section>

      <section className="surface mx-6 mt-5 flex divide-x divide-line rounded-2xl py-3.5">
        <Stat value={profile.counts.posts} label="Posts" />
        <StatLink
          value={profile.counts.followers}
          label="Followers"
          href={SOCIAL_GRAPH_ROUTES.followers(profile.handle)}
        />
        <StatLink
          value={profile.counts.following}
          label="Following"
          href={SOCIAL_GRAPH_ROUTES.following(profile.handle)}
        />
      </section>

      <div className="mx-6 mt-4 flex gap-3">
        <button
          type="button"
          onClick={refresh}
          className="surface flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-paper transition-colors hover:bg-cobalt/15"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
        <Link
          href={SOCIAL_GRAPH_ROUTES.editProfile}
          className="surface flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-paper transition-colors hover:bg-cobalt/15"
        >
          <Pencil size={15} />
          Edit profile
        </Link>
        <Link
          href={ROUTES.SETTINGS}
          className="surface flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-semibold text-paper transition-colors hover:bg-cobalt/15"
        >
          Settings
        </Link>
      </div>

      <section className="mx-6 mt-4 flex gap-3">
        <SocialLink icon={Heart} label="Friends" href={SOCIAL_GRAPH_ROUTES.friends} />
        <SocialLink icon={Inbox} label="Requests" href={SOCIAL_GRAPH_ROUTES.requests} />
        <SocialLink icon={ShieldOff} label="Blocked" href={SOCIAL_GRAPH_ROUTES.blocked} />
      </section>

      {profile.topTopics.length > 0 ? (
        <section className="mt-7 flex flex-col gap-3 px-6">
          <SectionLabel>Top topics</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {profile.topTopics.map(topic => (
              <span
                key={topic.slug}
                className="surface rounded-full px-3.5 py-2 text-[13px] font-semibold text-paper"
              >
                {topic.label}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-7 flex flex-col gap-4">
        <SectionLabel className="px-6">Posts</SectionLabel>
        {posts.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="No posts yet"
            body="Everything you publish will show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onOpenComments={setActivePost}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </section>

      <CommentSheet post={activePost} onClose={() => setActivePost(null)} />

      <ConfirmDialog
        open={confirmOpen}
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
        onCancel={() => setConfirmOpen(false)}
      />
    </ProfileShell>
  );
};
