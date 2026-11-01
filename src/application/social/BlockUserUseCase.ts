import type { SocialRepository } from '../../domain/repositories/SocialRepository';

export class BlockUserUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string): Promise<void> {
    return this.socialRepository.block(userId);
  }
}
