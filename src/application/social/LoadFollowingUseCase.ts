import type { FollowEdgeEntry, SocialRepository } from '../../domain/repositories/SocialRepository';
import type { Page, PageOptions } from '../../domain/repositories/common';

export class LoadFollowingUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(userId: string, options?: PageOptions): Promise<Page<FollowEdgeEntry>> {
    return this.socialRepository.following(userId, options);
  }
}
