import type { MuteScopeValue, SocialRepository } from '../../domain/repositories/SocialRepository';

export class MuteUserUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string, scope?: MuteScopeValue): Promise<void> {
    return this.socialRepository.mute(userId, scope);
  }
}
