'use client';

import { useQuery } from '@tanstack/react-query';

import type { Conversation } from '../../domain/entities/Conversation';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSession } from './useSession';

const POLL_MS = 20_000;

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

  const conversations = useQuery({
    queryKey: queryKeys.conversations(viewerId),
    queryFn: ({ signal }) => useCases.loadConversations.execute({ viewerId, signal }),
    enabled: isSignedIn,
    refetchInterval: POLL_MS,
  });

  return {
    conversations: conversations.data ?? [],
    isLoading: isSignedIn && conversations.isPending,
    isRefreshing: conversations.isFetching && !conversations.isPending,
    error: conversations.error,
    refresh: () => void conversations.refetch(),
  };
};
