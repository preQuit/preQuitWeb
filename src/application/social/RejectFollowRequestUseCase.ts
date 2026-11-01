import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class RejectFollowRequestUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(requestId: string): Promise<void> {
    return this.socialRepository.rejectFollowRequest(requestId);
  }
}
