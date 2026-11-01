import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class RemoveFollowerUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string): Promise<void> {
    return this.socialRepository.removeFollower(userId);
  }
}
