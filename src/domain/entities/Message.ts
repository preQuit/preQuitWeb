export const MessageDelivery = {
  PENDING: 'pending',
  SENT: 'sent',
  // The server reports these from per-message receipts and the conversation's
  // read high-water mark; without them a double tick has no state to render.
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

export type MessageDeliveryState = (typeof MessageDelivery)[keyof typeof MessageDelivery];

export type MessageKind = 'text' | 'image' | 'post_share';

export interface MessageMedia {
  readonly mediaId: string;
  readonly url?: string;
}

export interface MessageReaction {
  readonly userId: string;
  readonly emoji: string;
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly mine: boolean;
  readonly kind: MessageKind;
  readonly body: string;
  readonly media: MessageMedia | null;
  readonly replyToId: string | null;
  readonly reactions: readonly MessageReaction[];
  readonly delivery: MessageDeliveryState;
  /** When the peer's device acknowledged it; null until then. */
  readonly deliveredAt: string | null;
  /** When the peer opened the thread on it; null until then. */
  readonly seenAt: string | null;
  readonly deletedForAllAt: string | null;
  readonly createdAt: string | null;
  readonly clientNonce?: string;
}

export type MessagePayload = Partial<Omit<Message, 'mine'>> & {
  /** The server's own name for delivery state on REST and socket payloads. */
  readonly state?: string;
};

const DELIVERY_STATES = new Set<string>(Object.values(MessageDelivery));

// The server calls this `state`; the client calls it `delivery`. Reading only
// `delivery` meant every message rendered as "sent" no matter what the
// receipts said.
const toDelivery = (raw: MessagePayload): MessageDeliveryState => {
  if (raw.delivery) return raw.delivery;
  if (raw.state && DELIVERY_STATES.has(raw.state)) return raw.state as MessageDeliveryState;
  return MessageDelivery.SENT;
};

export const createMessage = (
  raw: MessagePayload = {},
  viewerId: string | null = null,
): Message => ({
  id: raw.id ?? '',
  conversationId: raw.conversationId ?? '',
  senderId: raw.senderId ?? '',
  mine: Boolean(viewerId) && raw.senderId === viewerId,
  kind: raw.kind ?? 'text',
  body: raw.body ?? '',
  media: raw.media ?? null,
  replyToId: raw.replyToId ?? null,
  reactions: raw.reactions ?? [],
  delivery: toDelivery(raw),
  deliveredAt: raw.deliveredAt ?? null,
  seenAt: raw.seenAt ?? null,
  deletedForAllAt: raw.deletedForAllAt ?? null,
  createdAt: raw.createdAt ?? null,
});

export interface PendingMessageInput {
  readonly clientNonce: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly body: string;
  readonly createdAt: string;
  readonly replyToId?: string | null;
}

export const createPendingMessage = (input: PendingMessageInput): Message => ({
  id: input.clientNonce,
  conversationId: input.conversationId,
  senderId: input.senderId,
  mine: true,
  kind: 'text',
  body: input.body,
  media: null,
  replyToId: input.replyToId ?? null,
  reactions: [],
  delivery: MessageDelivery.PENDING,
  deliveredAt: null,
  seenAt: null,
  deletedForAllAt: null,
  createdAt: input.createdAt,
  clientNonce: input.clientNonce,
});

export const withDeliveryFailed = (message: Message): Message => ({
  ...message,
  delivery: MessageDelivery.FAILED,
});
