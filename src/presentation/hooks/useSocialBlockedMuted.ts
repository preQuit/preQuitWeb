'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

export interface BlockedListViewModel {
  readonly blockedIds: readonly string[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly isUnblocking: boolean;
  unblock(userId: string): void;
}

/**
 * The backend has a mute *store* (`MuteStore.listMutedByMe`) but never wired
 * a `GET` route to it — only `/users/:userId/mute` (write-only) exists. With
 * zero backend work in scope this phase cannot list muted accounts, so the
 * screen built on this hook says so rather than pretending the list is just
 * empty.
 */
export const MUTES_LISTING_UNAVAILABLE = true;

export const useSocialBlockedMuted = (): BlockedListViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();

  const blocked = useQuery({
    queryKey: queryKeys.blocked,
    queryFn: ({ signal }) => useCases.loadBlocked.execute({ signal }),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => useCases.unblockUser.execute(userId),
    onMutate: async userId => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blocked });
      const previous = queryClient.getQueryData<readonly string[]>(queryKeys.blocked);
      queryClient.setQueryData<readonly string[]>(queryKeys.blocked, current =>
        current?.filter(id => id !== userId),
      );
      return { previous };
    },
    onError: (_error, _userId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.blocked, context.previous);
    },
  });

  return {
    blockedIds: blocked.data ?? [],
    isLoading: blocked.isPending,
    error: blocked.error,
    isUnblocking: unblockMutation.isPending,
    unblock: userId => unblockMutation.mutate(userId),
  };
};
