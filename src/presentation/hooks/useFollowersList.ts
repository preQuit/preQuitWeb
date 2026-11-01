'use client';

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import type { FollowEdgeEntry } from '../../domain/repositories/SocialRepository';
import type { Page } from '../../domain/repositories/common';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const LIMIT = 30;

export interface FollowersListViewModel {
  readonly items: readonly FollowEdgeEntry[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly hasMore: boolean;
  readonly error: unknown;
  readonly isRemoving: boolean;
  loadMore(): void;
  removeFollower(followerId: string): void;
}

type EdgePages = InfiniteData<Page<FollowEdgeEntry>, string | null>;

export const useFollowersList = (userId: string | null): FollowersListViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.followers(userId ?? '');

  const list = useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      useCases.loadFollowers.execute(userId ?? '', {
        limit: LIMIT,
        ...(pageParam ? { before: pageParam } : {}),
        signal,
      }),
    getNextPageParam: last => last.nextCursor,
    enabled: Boolean(userId),
  });

  const removeMutation = useMutation({
    mutationFn: (followerId: string) => useCases.removeFollower.execute(followerId),
    onMutate: followerId => {
      const previous = queryClient.getQueryData<EdgePages>(queryKey);
      queryClient.setQueryData<EdgePages>(queryKey, current =>
        current
          ? {
              ...current,
              pages: current.pages.map(page => ({
                ...page,
                items: page.items.filter(item => item.userId !== followerId),
              })),
            }
          : current,
      );
      return { previous };
    },
    onError: (_error, _followerId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  return {
    items: list.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: list.isPending,
    isLoadingMore: list.isFetchingNextPage,
    hasMore: Boolean(list.hasNextPage),
    error: list.error,
    isRemoving: removeMutation.isPending,
    loadMore: () => {
      if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
    },
    removeFollower: followerId => removeMutation.mutate(followerId),
  };
};
