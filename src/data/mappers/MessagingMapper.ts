import {
  createConversation,
  type Conversation,
  type ConversationPayload,
} from '../../domain/entities/Conversation';
import { createMessage, type Message, type MessagePayload } from '../../domain/entities/Message';
import type { PostAuthor } from '../../domain/entities/Post';

export interface ConversationDto extends Omit<ConversationPayload, 'lastMessage' | 'peer'> {
  readonly participant?: PostAuthor | null;
  readonly lastMessage?: {
    readonly body?: string;
    readonly preview?: string;
    readonly senderId?: string;
    readonly createdAt?: string | null;
    readonly at?: string | null;
  } | null;
}

const previewOf = (dto: ConversationDto, viewerId: string | null) => {
  const last = dto.lastMessage;
  if (!last) return null;
  return {
    body: last.body ?? last.preview ?? '',
    mine: Boolean(viewerId) && last.senderId === viewerId,
    createdAt: last.createdAt ?? last.at ?? null,
  };
};

const peerOf = (dto: ConversationDto, viewerId: string | null): PostAuthor | null => {
  if (dto.participant) return dto.participant;
  const peerId = (dto.participantIds ?? []).find(id => id !== viewerId);
  if (!peerId) return null;
  return { id: peerId, handle: '', displayName: '', avatarUrl: null };
};

export const toConversation = (
  dto: ConversationDto,
  viewerId: string | null = null,
): Conversation =>
  createConversation({
    ...dto,
    peer: peerOf(dto, viewerId),
    participantIds: dto.participantIds ?? [],
    lastMessage: previewOf(dto, viewerId),
  });

export const toConversationList = (
  rows: readonly ConversationDto[],
  viewerId: string | null = null,
): readonly Conversation[] => rows.map(row => toConversation(row, viewerId));

export const toMessage = (dto: MessagePayload | null, viewerId: string | null = null): Message =>
  createMessage(dto ?? {}, viewerId);

export const toMessageList = (
  rows: readonly MessagePayload[],
  viewerId: string | null = null,
): readonly Message[] => rows.map(row => createMessage(row, viewerId));
