import type { FollowResult, SocialRepository } from '../../domain/repositories/SocialRepository';

export class FollowUserUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string): Promise<FollowResult> {
    return this.socialRepository.follow(userId);
  }
}
