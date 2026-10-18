import type {
  ProfilePatch,
  ProfileRepository,
} from '../../domain/repositories/ProfileRepository';

export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(patch: ProfilePatch): Promise<unknown> {
    return this.profileRepository.updateProfile(patch);
  }
}
