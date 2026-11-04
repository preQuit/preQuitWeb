import type { User } from '../../domain/entities/User';
import type { SocialRepository } from '../../domain/repositories/SocialRepository';
import type { PageOptions } from '../../domain/repositories/common';

export class LoadSuggestedUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(options?: PageOptions): Promise<readonly User[]> {
    return this.socialRepository.suggested(options);
  }
}
