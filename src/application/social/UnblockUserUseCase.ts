import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class UnblockUserUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string): Promise<void> {
    return this.socialRepository.unblock(userId);
  }
}
