import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class CancelFollowRequestUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(requestId: string): Promise<void> {
    return this.socialRepository.cancelFollowRequest(requestId);
  }
}
