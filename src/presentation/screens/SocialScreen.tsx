'use client';

import { RefreshCw, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Post, PostAuthor } from '../../domain/entities/Post';
import { messageOf } from '../../domain/errors/AppError';
import {
  FeedSurface,
  type FeedSurfaceValue,
} from '../../domain/repositories/FeedRepository';
import { CommentSheet } from '../components/CommentSheet';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { Spinner } from '../components/Spinner';
import { useFeed } from '../hooks/useFeed';
import { useOpenConversation } from '../hooks/useOpenConversation';
import { conversationRoute } from '../navigation/routes';

interface SurfaceTab {
  readonly key: FeedSurfaceValue;
  readonly label: string;
}

const SURFACES: readonly SurfaceTab[] = [
  { key: FeedSurface.HOME, label: 'For You' },
  { key: FeedSurface.EXPLORE, label: 'Explore' },
  { key: FeedSurface.TRENDING, label: 'Trending' },
];

export const SocialScreen = () => {
  const router = useRouter();
  const [surface, setSurface] = useState<FeedSurfaceValue>(FeedSurface.HOME);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const { items, isLoading, isRefreshing, error, refresh, toggleLike, toggleSave } =
    useFeed(surface);
  const { open } = useOpenConversation();

  const openAuthorChat = async (author: PostAuthor) => {
    const conversationId = await open(author.id).catch(() => null);
    if (conversationId) router.push(conversationRoute(conversationId));
  };

  return (
    <main className="flex flex-col">
      <ScreenHeader
        title="Social"
        actions={
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh feed"
            className="text-muted transition-colors hover:text-paper"
          >
            <RefreshCw size={19} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        }
      />

      <div className="flex gap-2 px-5 pb-4" role="tablist" aria-label="Feed surface">
        {SURFACES.map(item => {
          const active = item.key === surface;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSurface(item.key)}
              className={`rounded-2xl px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                active ? 'bg-paper text-ink' : 'glass text-muted hover:text-paper'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={error ? 'Could not load the feed' : 'Nothing here yet'}
          body={
            error
              ? messageOf(error, 'Could not load the feed')
              : 'Follow a few people and their posts will show up here.'
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 px-4">
            {items.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onOpenAuthor={openAuthorChat}
                onOpenComments={setActivePost}
              />
            ))}
          </div>
          <p className="py-6 text-center text-[13px] text-muted">You are all caught up</p>
        </>
      )}

      <CommentSheet post={activePost} onClose={() => setActivePost(null)} />
    </main>
  );
};
