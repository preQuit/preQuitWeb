'use client';

import { useQuery } from '@tanstack/react-query';

import type { Conversation } from '../../domain/entities/Conversation';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useRealtime } from './useRealtime';
import { useSession } from './useSession';

// Degraded-mode fallback only: live updates arrive via notification:new (see
// useRealtime). This interval keeps the list fresh when the socket cannot connect at
// all (nginx not proxying the upgrade, corporate network blocking websockets, etc.)
// rather than leaving the inbox stuck on whatever it last loaded.
const DEGRADED_POLL_MS = 20_000;

export interface ConversationsViewModel {
  readonly conversations: readonly Conversation[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly error: unknown;
  refresh(): void;
}

export const useConversations = (): ConversationsViewModel => {
  const useCases = useUseCases();
  const { viewerId, isSignedIn } = useSession();
  const { status } = useRealtime(null);

  const conversations = useQuery({
    queryKey: queryKeys.conversations(viewerId),
    queryFn: ({ signal }) => useCases.loadConversations.execute({ viewerId, signal }),
    enabled: isSignedIn,
    refetchInterval: status === 'online' ? false : DEGRADED_POLL_MS,
  });

  return {
    conversations: conversations.data ?? [],
    isLoading: isSignedIn && conversations.isPending,
    isRefreshing: conversations.isFetching && !conversations.isPending,
    error: conversations.error,
    refresh: () => void conversations.refetch(),
  };
};
