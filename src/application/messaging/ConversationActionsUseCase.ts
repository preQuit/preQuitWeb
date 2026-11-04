import type { MessagingRepository } from '../../domain/repositories/MessagingRepository';
import type { SocialRepository } from '../../domain/repositories/SocialRepository';

/**
 * The destructive conversation actions behind the thread menu. Clearing and
 * deleting are both one-sided: the peer keeps their copy either way.
 */
export class ConversationActionsUseCase {
  constructor(
    private readonly messaging: MessagingRepository,
    private readonly social: SocialRepository,
  ) {}

  clear(conversationId: string): Promise<void> {
    return this.messaging.clearConversation(conversationId);
  }

  delete(conversationId: string): Promise<void> {
    return this.messaging.deleteConversation(conversationId);
  }

  block(userId: string): Promise<void> {
    return this.social.block(userId);
  }
}
