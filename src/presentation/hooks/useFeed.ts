'use client';

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { withLikeToggled, withSaveToggled, type Post } from '../../domain/entities/Post';
import { FeedSurface, type FeedSurfaceValue } from '../../domain/repositories/FeedRepository';
import type { Page } from '../../domain/repositories/common';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const DEFAULT_LIMIT = 20;

export interface FeedViewModel {
  readonly items: readonly Post[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly isLoadingMore: boolean;
  readonly hasMore: boolean;
  readonly error: unknown;
  refresh(): void;
  loadMore(): void;
  toggleLike(postId: string): void;
  toggleSave(postId: string): void;
}

type Transform = (post: Post) => Post;
type FeedPages = InfiniteData<Page<Post>, string | null>;

export const useFeed = (
  surface: FeedSurfaceValue = FeedSurface.HOME,
  limit: number = DEFAULT_LIMIT,
): FeedViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.feed(surface);

  const feed = useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      useCases.loadFeed.execute(surface, {
        limit,
        ...(pageParam ? { before: pageParam } : {}),
        signal,
      }),
    // A null cursor is the server saying there is nothing after this page.
    getNextPageParam: last => last.nextCursor,
  });

  const items = useMemo(
    () => feed.data?.pages.flatMap(page => page.items) ?? [],
    [feed.data],
  );

  /** Rewrite one post wherever it sits across the loaded pages. */
  const patch = useCallback(
    (postId: string, transform: Transform) => {
      queryClient.setQueryData<FeedPages>(queryKey, current =>
        current
          ? {
              ...current,
              pages: current.pages.map(page => ({
                ...page,
                items: page.items.map(item => (item.id === postId ? transform(item) : item)),
              })),
            }
          : current,
      );
    },
    [queryClient, queryKey],
  );

  const postOf = useCallback(
    (postId: string): Post | undefined =>
      queryClient
        .getQueryData<FeedPages>(queryKey)
        ?.pages.flatMap(page => page.items)
        .find(item => item.id === postId),
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
    items,
    isLoading: feed.isPending,
    isRefreshing: feed.isRefetching,
    isLoadingMore: feed.isFetchingNextPage,
    hasMore: feed.hasNextPage,
    error: feed.error,
    // Refetching an infinite query re-requests every loaded page in sequence.
    // Pull-to-refresh means "give me the top again", so drop back to one page
    // first and refetch that.
    refresh: () => {
      queryClient.setQueryData<FeedPages>(queryKey, current =>
        current
          ? { pages: current.pages.slice(0, 1), pageParams: current.pageParams.slice(0, 1) }
          : current,
      );
      void feed.refetch();
    },
    loadMore: () => {
      if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
    },
    toggleLike: postId => toggle(postId, withLikeToggled, post => likeMutation.mutate(post)),
    toggleSave: postId => toggle(postId, withSaveToggled, post => saveMutation.mutate(post)),
  };
};
