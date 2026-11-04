import { createMessage, MessageDelivery, type Message } from '../../domain/entities/Message';
import type { RawRealtimeMessage, RawRealtimeRef } from './RealtimeClient';

// SendMessageUseCase emits `message.toProps()` straight onto the socket instead of
// going through the REST presenter (messaging.routes.ts#presentMessage), so id-typed
// fields arrive as the raw domain value object ({ _value: "..." }), not a plain string.
const unwrapRef = (ref: RawRealtimeRef | null | undefined): string => {
  if (ref === null || ref === undefined) return '';
  if (typeof ref === 'string') return ref;
  return ref._value;
};

export const mapRealtimeMessage = (raw: RawRealtimeMessage, viewerId: string | null): Message =>
  createMessage(
    {
      id: unwrapRef(raw.id),
      conversationId: unwrapRef(raw.conversationId),
      senderId: unwrapRef(raw.senderId),
      kind: raw.kind as Message['kind'],
      body: raw.body ?? '',
      media: raw.media ? { mediaId: raw.media.mediaId } : null,
      replyToId: raw.replyToId ? unwrapRef(raw.replyToId) : null,
      reactions: (raw.reactions ?? []).map(reaction => ({ userId: reaction.userId, emoji: reaction.emoji })),
      delivery: MessageDelivery.SENT,
      createdAt: raw.createdAt,
      ...(raw.clientNonce ? { clientNonce: raw.clientNonce } : {}),
    },
    viewerId,
  );
