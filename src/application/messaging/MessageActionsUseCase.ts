import type { MessagingRepository } from '../../domain/repositories/MessagingRepository';

/** Per-message actions behind a message's own menu. */
export class MessageActionsUseCase {
  constructor(private readonly messaging: MessagingRepository) {}

  /**
   * `forEveryone` is the destructive one: it removes the message from the
   * peer's thread too. Without it the message is only hidden from this user.
   */
  delete(messageId: string, forEveryone: boolean): Promise<void> {
    return this.messaging.deleteMessage(messageId, forEveryone);
  }
}
