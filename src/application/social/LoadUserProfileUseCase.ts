import type { User } from '../../domain/entities/User';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import type { RequestOptions } from '../../domain/repositories/common';

export class LoadUserProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(handle: string, options?: RequestOptions): Promise<User> {
    return this.profileRepository.byHandle(handle, options);
  }
}
