import type { AuthRepository } from '../../domain/repositories/AuthRepository';

export class RequestPasswordResetUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(email: string): Promise<unknown> {
    return this.authRepository.requestPasswordReset(email.trim().toLowerCase());
  }
}
