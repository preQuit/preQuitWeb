'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import {
  createPendingMessage,
  withDeliveryFailed,
  type Message,
} from '../../domain/entities/Message';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useRealtime } from './useRealtime';
import { useSession } from './useSession';

// Degraded-mode fallback only: while connected, message:new appends to this cache
// directly (see useRealtime) so there is nothing for a poll to add. This interval only
// matters if the socket can't connect at all.
const DEGRADED_POLL_MS = 8_000;

const createNonce = (): string =>
  `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

interface Outgoing {
  readonly body: string;
  readonly clientNonce: string;
  readonly replyToId?: string | null;
}

export interface ConversationViewModel {
  readonly messages: readonly Message[];
  readonly isLoading: boolean;
  readonly isSending: boolean;
  readonly error: unknown;
  /** Peer ids currently typing in this thread, never the viewer. */
  readonly typingUserIds: readonly string[];
  send(body: string, replyToId?: string | null): Promise<void>;
  notifyTyping(): void;
  stopTyping(): void;
  deleteMessage(messageId: string, forEveryone: boolean): Promise<void>;
}

export const useConversation = (conversationId: string | null): ConversationViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const { viewerId } = useSession();
  const { status, typingUserIds, notifyTyping, stopTyping } = useRealtime(conversationId);
  const marked = useRef<string | null>(null);
  const queryKey = queryKeys.messages(conversationId ?? '', viewerId);

  const messages = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      useCases.loadMessages.execute(conversationId ?? '', { viewerId, signal }),
    enabled: Boolean(conversationId),
    refetchInterval: status === 'online' ? false : DEGRADED_POLL_MS,
  });

  const replace = useCallback(
    (nonce: string, transform: (message: Message) => Message) => {
      queryClient.setQueryData<readonly Message[]>(queryKey, current =>
        (current ?? []).map(message => (message.id === nonce ? transform(message) : message)),
      );
    },
    [queryClient, queryKey],
  );

  useEffect(() => {
    if (!conversationId || marked.current === conversationId) return;
    marked.current = conversationId;
    void useCases.markConversationRead.execute(conversationId).catch(() => undefined);
  }, [conversationId, useCases]);

  const sendMutation = useMutation({
    mutationFn: ({ body, clientNonce, replyToId }: Outgoing) =>
      useCases.sendMessage.execute(conversationId ?? '', { body, clientNonce, viewerId, replyToId }),
    onMutate: ({ body, clientNonce, replyToId }) => {
      const pending = createPendingMessage({
        clientNonce,
        conversationId: conversationId ?? '',
        senderId: viewerId ?? '',
        body,
        createdAt: new Date().toISOString(),
        replyToId,
      });
      queryClient.setQueryData<readonly Message[]>(queryKey, current => [
        ...(current ?? []),
        pending,
      ]);
    },
    onSuccess: (confirmed, { clientNonce }) => {
      if (!confirmed) return;
      replace(clientNonce, () => ({ ...confirmed, mine: true }));
    },
    onError: (_error, { clientNonce }) => replace(clientNonce, withDeliveryFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ messageId, forEveryone }: { messageId: string; forEveryone: boolean }) =>
      useCases.messageActions.delete(messageId, forEveryone),
    onMutate: ({ messageId }) => {
      const previous = queryClient.getQueryData<readonly Message[]>(queryKey);
      queryClient.setQueryData<readonly Message[]>(queryKey, current =>
        (current ?? []).filter(message => message.id !== messageId),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  return {
    messages: messages.data ?? [],
    isLoading: Boolean(conversationId) && messages.isPending,
    isSending: sendMutation.isPending,
    error: messages.error,
    typingUserIds,
    send: async (body, replyToId = null) => {
      const trimmed = body.trim();
      if (!trimmed || !conversationId) return;
      stopTyping();
      await sendMutation.mutateAsync({ body: trimmed, clientNonce: createNonce(), replyToId });
    },
    notifyTyping,
    stopTyping,
    deleteMessage: async (messageId, forEveryone) => {
      await deleteMutation.mutateAsync({ messageId, forEveryone });
    },
  };
};
