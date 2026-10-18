'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  withLikeToggled,
  withSaveToggled,
  type Post,
} from '../../domain/entities/Post';
import {
  FeedSurface,
  type FeedSurfaceValue,
} from '../../domain/repositories/FeedRepository';
import type { Page } from '../../domain/repositories/common';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const DEFAULT_LIMIT = 20;

export interface FeedViewModel {
  readonly items: readonly Post[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly error: unknown;
  refresh(): void;
  toggleLike(postId: string): void;
  toggleSave(postId: string): void;
}

type Transform = (post: Post) => Post;

export const useFeed = (
  surface: FeedSurfaceValue = FeedSurface.HOME,
  limit: number = DEFAULT_LIMIT,
): FeedViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.feed(surface);

  const feed = useQuery({
    queryKey,
    queryFn: ({ signal }) => useCases.loadFeed.execute(surface, { limit, signal }),
  });

  const patch = useCallback(
    (postId: string, transform: Transform) => {
      queryClient.setQueryData<Page<Post>>(queryKey, current =>
        current
          ? {
              ...current,
              items: current.items.map(item => (item.id === postId ? transform(item) : item)),
            }
          : current,
      );
    },
    [queryClient, queryKey],
  );

  const postOf = useCallback(
    (postId: string): Post | undefined =>
      queryClient.getQueryData<Page<Post>>(queryKey)?.items.find(item => item.id === postId),
    [queryClient, queryKey],
  );

  const likeMutation = useMutation({
    mutationFn: (post: Post) => useCases.toggleLike.execute(post),
    onError: (_error, post) => patch(post.id, () => post),
  });

  const saveMutation = useMutation({
    mutationFn: (post: Post) => useCases.toggleSave.execute(post),
    onError: (_error, post) => patch(post.id, () => post),
  });

  const toggle = useCallback(
    (postId: string, transform: Transform, commit: (post: Post) => void) => {
      const current = postOf(postId);
      if (!current) return;
      patch(postId, transform);
      commit(current);
    },
    [patch, postOf],
  );

  return {
    items: feed.data?.items ?? [],
    isLoading: feed.isPending,
    isRefreshing: feed.isFetching && !feed.isPending,
    error: feed.error,
    refresh: () => void feed.refetch(),
    toggleLike: postId => toggle(postId, withLikeToggled, post => likeMutation.mutate(post)),
    toggleSave: postId => toggle(postId, withSaveToggled, post => saveMutation.mutate(post)),
  };
};
