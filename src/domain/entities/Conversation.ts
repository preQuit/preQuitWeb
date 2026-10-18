import type { PostAuthor } from './Post';

export interface ConversationPreview {
  readonly body: string;
  readonly mine: boolean;
  readonly createdAt: string | null;
}

export type ConversationState = 'active' | 'read_only' | 'closed';

export interface Conversation {
  readonly id: string;
  readonly participantIds: readonly string[];
  readonly peer: PostAuthor | null;
  readonly lastMessage: ConversationPreview | null;
  readonly unreadCount: number;
  readonly state: ConversationState;
  readonly createdAt: string | null;
}

export type ConversationPayload = Partial<Conversation>;

export const createConversation = (raw: ConversationPayload = {}): Conversation => ({
  id: raw.id ?? '',
  participantIds: raw.participantIds ?? [],
  peer: raw.peer ?? null,
  lastMessage: raw.lastMessage ?? null,
  unreadCount: raw.unreadCount ?? 0,
  state: raw.state ?? 'active',
  createdAt: raw.createdAt ?? null,
});

export const peerIdOf = (conversation: Conversation, viewerId: string | null): string | null =>
  conversation.participantIds.find(id => id !== viewerId) ?? null;

const SHORT_ID_LENGTH = 6;

export const nameOf = (conversation: Conversation): string => {
  const { peer } = conversation;
  if (peer?.displayName) return peer.displayName;
  if (peer?.handle) return `@${peer.handle}`;
  if (peer?.id) return `User ${peer.id.slice(-SHORT_ID_LENGTH)}`;
  return 'Conversation';
};
