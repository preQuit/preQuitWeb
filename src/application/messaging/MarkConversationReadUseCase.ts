import type { MessagingRepository } from '../../domain/repositories/MessagingRepository';

export class MarkConversationReadUseCase {
  constructor(private readonly messagingRepository: MessagingRepository) {}

  execute(conversationId: string): Promise<unknown> {
    return this.messagingRepository.markRead(conversationId);
  }
}
