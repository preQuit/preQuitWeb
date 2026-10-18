'use client';

import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import { memo, useState } from 'react';

import type { Post, PostAuthor } from '../../domain/entities/Post';
import { formatCount, formatRelative } from '../format';
import { Avatar } from './Avatar';

export interface PostCardProps {
  readonly post: Post;
  onToggleLike?(postId: string): void;
  onToggleSave?(postId: string): void;
  onOpenAuthor?(author: PostAuthor): void;
  onOpenComments?(post: Post): void;
}

const PostCardView = ({
  post,
  onToggleLike,
  onToggleSave,
  onOpenAuthor,
  onOpenComments,
}: PostCardProps) => {
  const [mediaFailed, setMediaFailed] = useState(false);
  const { author, counts, viewer } = post;
  const image = post.media[0];
  const published = formatRelative(post.publishedAt);

  return (
    <article className="glass animate-rise overflow-hidden rounded-glass">
      <header className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => onOpenAuthor?.(author)}
          disabled={!onOpenAuthor}
          className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
        >
          <Avatar name={author.displayName || author.handle} url={author.avatarUrl} />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold text-paper">
              {author.displayName}
            </span>
            <span className="block truncate text-[13px] text-muted">@{author.handle}</span>
          </span>
        </button>
        {published ? <span className="text-xs text-muted">{published}</span> : null}
      </header>

      {post.reason?.label ? (
        <p className="glass-subtle mx-4 mb-2.5 w-fit rounded-xl px-2.5 py-1 text-[11px] tracking-wide text-muted">
          {post.reason.label}
        </p>
      ) : null}

      {post.description ? (
        <p className="px-4 pb-3 text-[15px] leading-6 whitespace-pre-wrap text-paper">
          {post.description}
        </p>
      ) : null}

      {image?.urls.feed && !mediaFailed ? (
        <img
          src={image.urls.feed}
          alt={image.altText ?? ''}
          loading="lazy"
          onError={() => setMediaFailed(true)}
          className="aspect-square w-full bg-white/5 object-cover"
        />
      ) : null}

      {post.topics.length > 0 ? (
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 px-4 pt-3">
          {post.topics.map(topic => (
            <span key={topic.slug} className="text-xs text-muted">
              #{topic.slug}
            </span>
          ))}
        </div>
      ) : null}

      <footer className="flex items-center gap-5 px-4 py-3">
        <button
          type="button"
          onClick={() => onToggleLike?.(post.id)}
          disabled={!onToggleLike}
          aria-pressed={viewer.hasLiked}
          aria-label={viewer.hasLiked ? 'Unlike' : 'Like'}
          className="flex items-center gap-1.5 text-muted transition-colors hover:text-paper disabled:cursor-default"
        >
          <Heart
            size={21}
            className={viewer.hasLiked ? 'fill-like text-like' : 'text-paper'}
          />
          <span className="text-[13px]">{formatCount(counts.likes)}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenComments?.(post)}
          disabled={!onOpenComments}
          aria-label="Open comments"
          className="flex items-center gap-1.5 text-muted transition-colors hover:text-paper disabled:cursor-default"
        >
          <MessageCircle size={20} className="text-paper" />
          <span className="text-[13px]">{formatCount(counts.comments)}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSave?.(post.id)}
          disabled={!onToggleSave}
          aria-pressed={viewer.hasSaved}
          aria-label={viewer.hasSaved ? 'Remove from saved' : 'Save'}
          className="ml-auto text-paper transition-opacity hover:opacity-80 disabled:cursor-default"
        >
          <Bookmark size={20} className={viewer.hasSaved ? 'fill-paper' : ''} />
        </button>
      </footer>
    </article>
  );
};

export const PostCard = memo(PostCardView);
