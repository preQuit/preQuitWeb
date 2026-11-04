import type { Conversation } from '../../domain/entities/Conversation';
import type { Message, MessagePayload } from '../../domain/entities/Message';
import { AppError, ErrorCode } from '../../domain/errors/AppError';
import type {
  MessagingRepository,
  OutgoingMessage,
  ViewerScopedOptions,
} from '../../domain/repositories/MessagingRepository';
import type { HttpClient } from '../http/HttpClient';
import {
  toConversationList,
  toMessage,
  toMessageList,
  type ConversationDto,
} from '../mappers/MessagingMapper';

export class HttpMessagingRepository implements MessagingRepository {
  constructor(private readonly http: HttpClient) {}

  async conversations(options: ViewerScopedOptions = {}): Promise<readonly Conversation[]> {
    const { limit = 20, viewerId = null, signal } = options;
    const page = await this.http.getPage<ConversationDto>('/conversations', {
      params: { limit },
      ...(signal ? { signal } : {}),
    });
    return toConversationList(page.items, viewerId);
  }

  async clearConversation(conversationId: string): Promise<void> {
    await this.http.post(`/conversations/${conversationId}/clear`);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.http.delete(`/conversations/${conversationId}`);
  }

  async openConversation(peerId: string): Promise<string | null> {
    const dto = await this.http.post<{ id?: string }>('/conversations', { userId: peerId });
    return dto?.id ?? null;
  }

  async messages(
    conversationId: string,
    options: ViewerScopedOptions = {},
  ): Promise<readonly Message[]> {
    const { limit = 50, before, viewerId = null, signal } = options;
    const page = await this.http.getPage<MessagePayload>(
      `/conversations/${conversationId}/messages`,
      {
        params: { limit, before },
        ...(signal ? { signal } : {}),
      },
    );
    return toMessageList(page.items, viewerId);
  }

  async sendMessage(conversationId: string, message: OutgoingMessage): Promise<Message> {
    const { body, clientNonce, viewerId = null, replyToId = null } = message;
    const dto = await this.http.post<MessagePayload>(
      `/conversations/${conversationId}/messages`,
      { body, clientNonce, replyToId },
    );
    if (!dto) throw new AppError('The message could not be sent.', { code: ErrorCode.UNKNOWN });
    return toMessage(dto, viewerId);
  }

  async deleteMessage(messageId: string, forEveryone: boolean): Promise<void> {
    // Sent as an explicit string: the route reads "true"/"false", because a
    // coerced boolean treats the string "false" as true.
    await this.http.delete(`/messages/${messageId}?forEveryone=${forEveryone ? 'true' : 'false'}`);
  }

  markRead(conversationId: string): Promise<unknown> {
    return this.http.post(`/conversations/${conversationId}/read`);
  }
}
