import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class AcceptFollowRequestUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(requestId: string): Promise<void> {
    return this.socialRepository.acceptFollowRequest(requestId);
  }
}
