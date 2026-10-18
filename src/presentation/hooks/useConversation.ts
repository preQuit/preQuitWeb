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
import { useSession } from './useSession';

const POLL_MS = 8_000;

const createNonce = (): string =>
  `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

interface Outgoing {
  readonly body: string;
  readonly clientNonce: string;
}

export interface ConversationViewModel {
  readonly messages: readonly Message[];
  readonly isLoading: boolean;
  readonly isSending: boolean;
  readonly error: unknown;
  send(body: string): Promise<void>;
}

export const useConversation = (conversationId: string | null): ConversationViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const { viewerId } = useSession();
  const marked = useRef<string | null>(null);
  const queryKey = queryKeys.messages(conversationId ?? '', viewerId);

  const messages = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      useCases.loadMessages.execute(conversationId ?? '', { viewerId, signal }),
    enabled: Boolean(conversationId),
    refetchInterval: POLL_MS,
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
    mutationFn: ({ body, clientNonce }: Outgoing) =>
      useCases.sendMessage.execute(conversationId ?? '', { body, clientNonce, viewerId }),
    onMutate: ({ body, clientNonce }) => {
      const pending = createPendingMessage({
        clientNonce,
        conversationId: conversationId ?? '',
        senderId: viewerId ?? '',
        body,
        createdAt: new Date().toISOString(),
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

  return {
    messages: messages.data ?? [],
    isLoading: Boolean(conversationId) && messages.isPending,
    isSending: sendMutation.isPending,
    error: messages.error,
    send: async body => {
      const trimmed = body.trim();
      if (!trimmed || !conversationId) return;
      await sendMutation.mutateAsync({ body: trimmed, clientNonce: createNonce() });
    },
  };
};
