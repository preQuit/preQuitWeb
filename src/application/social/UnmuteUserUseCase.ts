import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class UnmuteUserUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string): Promise<void> {
    return this.socialRepository.unmute(userId);
  }
}
