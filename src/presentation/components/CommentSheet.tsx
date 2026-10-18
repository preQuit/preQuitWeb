'use client';

import { Heart, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { authorLabelOf, type Comment } from '../../domain/entities/Comment';
import type { Post } from '../../domain/entities/Post';
import { useComments } from '../hooks/useComments';
import { formatRelative } from '../format';
import { Avatar } from './Avatar';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';

interface CommentRowProps {
  readonly comment: Comment;
}

const CommentRow = ({ comment }: CommentRowProps) => (
  <li className="flex gap-3">
    <Avatar name={authorLabelOf(comment)} url={comment.author.avatarUrl} size="sm" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-paper">{authorLabelOf(comment)}</span>
        <span className="text-xs text-muted">{formatRelative(comment.createdAt)}</span>
      </div>
      <p className="mt-0.5 text-sm leading-5 whitespace-pre-wrap text-paper">{comment.body}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-muted">
        <Heart size={14} />
        <span className="text-xs">{comment.counts.likes}</span>
      </div>
    </div>
  </li>
);

export interface CommentSheetProps {
  readonly post: Post | null;
  onClose(): void;
}

export const CommentSheet = ({ post, onClose }: CommentSheetProps) => {
  const { comments, isLoading, isSubmitting, addComment } = useComments(post?.id ?? null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!post) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || isSubmitting) return;
    setDraft('');
    await addComment(body).catch(() => undefined);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
    >
      <button
        type="button"
        aria-label="Close comments"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="glass-raised animate-sheet relative flex max-h-[80vh] w-full max-w-xl flex-col rounded-t-3xl sm:rounded-3xl">
        <span className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" />

        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
          <h2 className="flex-1 text-base font-bold text-paper">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-paper transition-opacity hover:opacity-70"
          >
            <X size={21} />
          </button>
        </header>

        <div className="min-h-32 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : comments.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No comments yet" />
          ) : (
            <ul className="flex flex-col gap-4.5">
              {comments.map(comment => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={submit}
          className="flex items-center gap-2.5 border-t border-white/10 px-4 py-3"
        >
          <input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Add a comment"
            aria-label="Add a comment"
            className="glass-field h-11 min-w-0 flex-1 rounded-full px-4 text-sm text-paper outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting || draft.trim().length === 0}
            aria-label="Send comment"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition-opacity disabled:opacity-40"
          >
            {isSubmitting ? <Spinner size="sm" /> : <Send size={17} />}
          </button>
        </form>
      </section>
    </div>
  );
};
