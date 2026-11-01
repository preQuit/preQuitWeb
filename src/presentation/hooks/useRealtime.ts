'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { Message } from '../../domain/entities/Message';
import type {
  RealtimeConnectionStatus,
  RealtimeMessageReadPayload,
  RealtimeNotificationNewPayload,
} from '../../data/realtime/RealtimeClient';
import { mapRealtimeMessage } from '../../data/realtime/RealtimeMessageMapper';
import { useRealtimeClient } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSession } from './useSession';

export interface RealtimeViewModel {
  readonly status: RealtimeConnectionStatus;
  /** userIds (never the viewer) currently typing in the active conversation. */
  readonly typingUserIds: readonly string[];
  /** The peer's latest read high-water mark for the active conversation, if any arrived. */
  readonly peerReadReceipt: RealtimeMessageReadPayload | null;
  notifyTyping(): void;
  stopTyping(): void;
  setPresenceVisibility(visible: boolean): void;
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

// Ad hoc, not in queryKeys.ts: this cache slot exists so a socket payload has somewhere
// to land for any consumer to read later (e.g. a message-list view rendering a read
// tick), without forcing every reader through this hook's return value.
const readReceiptQueryKey = (conversationId: string) => ['realtime', 'readReceipt', conversationId] as const;

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
  const [typingUserIds, setTypingUserIds] = useState<readonly string[]>([]);
  const [peerReadReceipt, setPeerReadReceipt] = useState<RealtimeMessageReadPayload | null>(null);

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

  // Typing/read state is scoped to whichever conversation is active; switching threads
  // (or losing the active one) must not carry stale state into the next mount.
  useEffect(() => {
    setTypingUserIds([]);
    setPeerReadReceipt(null);
  }, [activeConversationId]);

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

  useEffect(() => {
    if (!isSignedIn || !activeConversationId) return undefined;

    return client.on('message:read', payload => {
      if (payload.conversationId !== activeConversationId) return;
      setPeerReadReceipt(payload);
      queryClient.setQueryData(readReceiptQueryKey(activeConversationId), payload);
    });
  }, [client, isSignedIn, activeConversationId, queryClient]);

  useEffect(() => {
    if (!isSignedIn || !activeConversationId) return undefined;

    return client.on('typing:update', payload => {
      if (payload.conversationId !== activeConversationId) return;
      setTypingUserIds(current => {
        const without = current.filter(id => id !== payload.userId);
        return payload.isTyping ? [...without, payload.userId] : without;
      });
    });
  }, [client, isSignedIn, activeConversationId]);

  const notifyTyping = useCallback(() => {
    if (activeConversationId) client.notifyTyping(activeConversationId);
  }, [client, activeConversationId]);

  const stopTyping = useCallback(() => {
    if (activeConversationId) client.stopTyping(activeConversationId);
  }, [client, activeConversationId]);

  const setPresenceVisibility = useCallback((visible: boolean) => client.setPresenceVisibility(visible), [client]);

  return { status, typingUserIds, peerReadReceipt, notifyTyping, stopTyping, setPresenceVisibility };
};
