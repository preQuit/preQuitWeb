'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { FollowEdgeEntry } from '../../domain/repositories/SocialRepository';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const LIMIT = 30;

export interface FollowingListViewModel {
  readonly items: readonly FollowEdgeEntry[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly hasMore: boolean;
  readonly error: unknown;
  loadMore(): void;
}

export const useFollowingList = (userId: string | null): FollowingListViewModel => {
  const useCases = useUseCases();
  const queryKey = queryKeys.following(userId ?? '');

  const list = useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      useCases.loadFollowing.execute(userId ?? '', {
        limit: LIMIT,
        ...(pageParam ? { before: pageParam } : {}),
        signal,
      }),
    getNextPageParam: last => last.nextCursor,
    enabled: Boolean(userId),
  });

  return {
    items: list.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: list.isPending,
    isLoadingMore: list.isFetchingNextPage,
    hasMore: Boolean(list.hasNextPage),
    error: list.error,
    loadMore: () => {
      if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
    },
  };
};
