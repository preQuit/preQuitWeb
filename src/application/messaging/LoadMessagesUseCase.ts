import type { Message } from '../../domain/entities/Message';
import type {
  MessagingRepository,
  ViewerScopedOptions,
} from '../../domain/repositories/MessagingRepository';

export class LoadMessagesUseCase {
  constructor(private readonly messagingRepository: MessagingRepository) {}

  async execute(conversationId: string, options?: ViewerScopedOptions): Promise<readonly Message[]> {
    const messages = await this.messagingRepository.messages(conversationId, options);
    // The API pages newest-first, which is right for a cursor and wrong for a
    // transcript. Rendered as-is the newest message lands at the top while the
    // view auto-scrolls to the bottom, so a just-sent message looks lost on the
    // next refetch. A chat reads oldest to newest.
    return [...messages].sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return left - right;
    });
  }
}
