import type { User } from '../entities/User';
import type { RequestOptions } from './common';

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: User;
}

export interface RegistrationDetails {
  readonly handle: string;
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
  readonly dateOfBirth: string;
}

export interface RegistrationResult {
  readonly user: User;
  readonly nextStep: string;
}

export interface AuthRepository {
  signIn(identifier: string, password: string): Promise<AuthSession>;
  signUp(details: RegistrationDetails): Promise<RegistrationResult>;
  signOut(): Promise<unknown>;
  me(options?: RequestOptions): Promise<User>;
  isHandleAvailable(handle: string, options?: RequestOptions): Promise<boolean>;
  requestPasswordReset(email: string): Promise<unknown>;
}
