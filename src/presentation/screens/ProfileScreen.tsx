'use client';

import { ImageOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { Post } from '../../domain/entities/Post';
import { initialOf } from '../../domain/entities/User';
import { messageOf } from '../../domain/errors/AppError';
import { CommentSheet } from '../components/CommentSheet';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { SectionLabel } from '../components/SectionLabel';
import { Spinner } from '../components/Spinner';
import { formatCount } from '../format';
import { useMyProfile } from '../hooks/useProfile';
import { ROUTES } from '../navigation/routes';

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

export const ProfileScreen = () => {
  const { profile, posts, isLoading, isRefreshing, error, refresh } = useMyProfile();
  const [activePost, setActivePost] = useState<Post | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-8">
        <p className="text-center text-sm text-muted">
          {messageOf(error, 'Profile unavailable')}
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col pt-10">
      <section className="flex flex-col items-center px-6">
        <span className="glass-raised flex size-30 items-center justify-center rounded-full text-5xl font-extrabold text-paper shadow-[0_0_48px_rgba(255,255,255,0.22)]">
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

      <section className="glass mx-6 mt-5 flex divide-x divide-white/10 rounded-2xl py-3.5">
        <Stat value={profile.counts.posts} label="Posts" />
        <Stat value={profile.counts.followers} label="Followers" />
        <Stat value={profile.counts.following} label="Following" />
      </section>

      <div className="mx-6 mt-4 flex gap-3">
        <button
          type="button"
          onClick={refresh}
          className="glass flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
        <Link
          href={ROUTES.SETTINGS}
          className="glass flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10"
        >
          Settings
        </Link>
      </div>

      {profile.topTopics.length > 0 ? (
        <section className="mt-7 flex flex-col gap-3 px-6">
          <SectionLabel>Top topics</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {profile.topTopics.map(topic => (
              <span
                key={topic.slug}
                className="glass rounded-full px-3.5 py-2 text-[13px] font-semibold text-paper"
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
          <div className="flex flex-col gap-4 px-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onOpenComments={setActivePost} />
            ))}
          </div>
        )}
      </section>

      <CommentSheet post={activePost} onClose={() => setActivePost(null)} />
    </main>
  );
};
