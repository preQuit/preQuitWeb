'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { Message } from '../../domain/entities/Message';
import type { RealtimeConnectionStatus, RealtimeNotificationNewPayload } from '../../data/realtime/RealtimeClient';
import { mapRealtimeMessage } from '../../data/realtime/RealtimeMessageMapper';
import { useRealtimeClient } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSession } from './useSession';

export interface RealtimeViewModel {
  readonly status: RealtimeConnectionStatus;
}

const upsertMessage = (current: readonly Message[], incoming: Message): readonly Message[] => {
  const byId = current.findIndex(message => message.id === incoming.id);
  if (byId !== -1) {
    const next = [...current];
    next[byId] = incoming;
    return next;
  }
  if (incoming.clientNonce) {
    const byNonce = current.findIndex(
      message => message.id === incoming.clientNonce || message.clientNonce === incoming.clientNonce,
    );
    if (byNonce !== -1) {
      const next = [...current];
      next[byNonce] = incoming;
      return next;
    }
  }
  return [...current, incoming];
};

const conversationIdFromNotification = (payload: RealtimeNotificationNewPayload): string | null => {
  if (payload.conversationId) return payload.conversationId;
  const subject = payload.notification?.subject;
  if (subject?.kind === 'conversation') return subject.id;
  return null;
};

/**
 * One instance of this hook owns the open thread (activeConversationId set), another
 * owns the inbox list (activeConversationId null) — see useConversation/useConversations.
 * Splitting the two responsibilities by that parameter, rather than coordinating two
 * hook instances directly, is what keeps a message arriving for the open thread from
 * also incrementing that same thread's unread count in the list below it.
 */
export const useRealtime = (activeConversationId: string | null): RealtimeViewModel => {
  const client = useRealtimeClient();
  const { isSignedIn, viewerId } = useSession();
  const queryClient = useQueryClient();

  const status = useSyncExternalStore(
    listener => client.onStatusChange(listener),
    () => client.status(),
    () => 'idle' as RealtimeConnectionStatus,
  );

  useEffect(() => {
    if (!isSignedIn) {
      client.forceDisconnect();
      return undefined;
    }
    client.connect();
    return () => client.disconnect();
  }, [client, isSignedIn]);

  useEffect(() => {
    if (!activeConversationId) return undefined;
    client.joinConversation(activeConversationId);
    client.setActiveConversation(activeConversationId);
    return () => {
      client.leaveConversation(activeConversationId);
      if (client.getActiveConversation() === activeConversationId) client.setActiveConversation(null);
    };
  }, [client, activeConversationId]);

  useEffect(() => {
    if (!isSignedIn) return undefined;

    // Only the open thread joins its conversation:<id> room (SocketIoRealtimeGateway
    // only broadcasts message:new to that room), so this branch never fires for the
    // inbox-list instance (activeConversationId null) — there is nothing for it to join.
    if (activeConversationId) {
      return client.on('message:new', ({ message }) => {
        const mapped = mapRealtimeMessage(message, viewerId);
        if (mapped.conversationId !== activeConversationId) return;
        queryClient.setQueryData<readonly Message[]>(queryKeys.messages(activeConversationId, viewerId), current =>
          upsertMessage(current ?? [], mapped),
        );
      });
    }

    // notification:new rides the always-joined user:<id> room, so it's the only live
    // signal the inbox gets about conversations it hasn't opened. The payload never
    // carries the message body — SendMessageUseCase emits {kind,conversationId}, and the
    // outbox-driven MessageSentNotificationHandler separately re-emits the same event as
    // {notification:{subject:{preview:<message kind, not text>}}} — and a single send can
    // fire both. Hand-patching lastMessage/unreadCount from either shape risks a wrong
    // preview or a double-counted badge; invalidating is idempotent and pulls the real row.
    return client.on('notification:new', payload => {
      const conversationId = conversationIdFromNotification(payload);
      if (!conversationId || conversationId === client.getActiveConversation()) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(viewerId) });
    });
  }, [client, isSignedIn, activeConversationId, viewerId, queryClient]);

  return { status };
};
