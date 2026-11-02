'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { ROUTES } from '../navigation/routes';
import { useSession } from './useSession';

export interface ConversationActionsViewModel {
  readonly isWorking: boolean;
  clearChat(): void;
  deleteChat(): void;
  blockPeer(): void;
}

export const useConversationActions = (
  conversationId: string | null,
  peerId: string | null,
): ConversationActionsViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { viewerId } = useSession();

  const invalidateThread = (): void => {
    if (conversationId) void queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId, viewerId) });
  };
  const invalidateList = (): void => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(viewerId) });
  };

  const clear = useMutation({
    mutationFn: () => useCases.conversationActions.clear(conversationId ?? ''),
    onSuccess: () => {
      invalidateThread();
      invalidateList();
    },
  });

  // Delete and block both remove the thread from this user's list, so there is
  // nothing left to show on this route afterwards.
  const remove = useMutation({
    mutationFn: () => useCases.conversationActions.delete(conversationId ?? ''),
    onSuccess: () => {
      invalidateList();
      router.replace(ROUTES.CHATS);
    },
  });

  const block = useMutation({
    mutationFn: async () => {
      await useCases.conversationActions.block(peerId ?? '');
      if (conversationId) await useCases.conversationActions.delete(conversationId);
    },
    onSuccess: () => {
      invalidateList();
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocked });
      router.replace(ROUTES.CHATS);
    },
  });

  return {
    isWorking: clear.isPending || remove.isPending || block.isPending,
    clearChat: () => {
      if (conversationId) clear.mutate();
    },
    deleteChat: () => {
      if (conversationId) remove.mutate();
    },
    blockPeer: () => {
      if (peerId) block.mutate();
    },
  };
};
