import type {
  FollowRequestDirectionValue,
  FollowRequestEntry,
  SocialRepository,
} from '../../domain/repositories/SocialRepository';
import type { Page, PageOptions } from '../../domain/repositories/common';

export class LoadFollowRequestsUseCase {
  constructor(private readonly socialRepository: SocialRepository) {}

  execute(
    direction: FollowRequestDirectionValue,
    options?: PageOptions,
  ): Promise<Page<FollowRequestEntry>> {
    return this.socialRepository.followRequests(direction, options);
  }
}
