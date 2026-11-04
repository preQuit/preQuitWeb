import type { SocialRepository } from '../../domain/repositories/SocialRepository';
import type { RequestOptions } from '../../domain/repositories/common';

export class LoadMutualsUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(options?: RequestOptions): Promise<readonly string[]> {
    return this.socialRepository.mutuals(options);
  }
}
