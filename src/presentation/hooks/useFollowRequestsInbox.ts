'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  FollowRequestDirectionValue,
  FollowRequestEntry,
} from '../../domain/repositories/SocialRepository';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const LIMIT = 50;

export interface FollowRequestsInboxViewModel {
  readonly items: readonly FollowRequestEntry[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly isActing: boolean;
  accept(requestId: string): void;
  reject(requestId: string): void;
  cancel(requestId: string): void;
}

export const useFollowRequestsInbox = (
  direction: FollowRequestDirectionValue,
): FollowRequestsInboxViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.followRequests(direction);

  const list = useQuery({
    queryKey,
    queryFn: ({ signal }) => useCases.loadFollowRequests.execute(direction, { limit: LIMIT, signal }),
  });

  const removeFromList = (requestId: string) => {
    queryClient.setQueryData<{ items: readonly FollowRequestEntry[]; nextCursor: string | null }>(
      queryKey,
      current =>
        current
          ? { ...current, items: current.items.filter(item => item.id !== requestId) }
          : current,
    );
  };

  const optimisticRemovalOptions = {
    onMutate: async (requestId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      removeFromList(requestId);
      return { previous };
    },
    onError: (_error: unknown, _requestId: string, context?: { previous: unknown }) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  };

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => useCases.acceptFollowRequest.execute(requestId),
    ...optimisticRemovalOptions,
  });
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => useCases.rejectFollowRequest.execute(requestId),
    ...optimisticRemovalOptions,
  });
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => useCases.cancelFollowRequest.execute(requestId),
    ...optimisticRemovalOptions,
  });

  return {
    items: list.data?.items ?? [],
    isLoading: list.isPending,
    error: list.error,
    isActing: acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending,
    accept: requestId => acceptMutation.mutate(requestId),
    reject: requestId => rejectMutation.mutate(requestId),
    cancel: requestId => cancelMutation.mutate(requestId),
  };
};
