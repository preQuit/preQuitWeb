import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { RequestOptions } from '../../domain/repositories/common';

export class CheckHandleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(handle: string, options?: RequestOptions): Promise<boolean> {
    const trimmed = handle.trim();
    if (!trimmed) return Promise.resolve(false);
    return this.authRepository.isHandleAvailable(trimmed.toLowerCase(), options);
  }
}
