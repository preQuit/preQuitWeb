import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class UnfollowUserUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string): Promise<void> {
    return this.socialRepository.unfollow(userId);
  }
}
