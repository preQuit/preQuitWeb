import type { UserPayload } from '../../domain/entities/User';
import { AppError, ErrorCode } from '../../domain/errors/AppError';
import type {
  AuthRepository,
  AuthSession,
  RegistrationDetails,
  RegistrationResult,
} from '../../domain/repositories/AuthRepository';
import type { RequestOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { toUser } from '../mappers/UserMapper';

const PUBLIC = { authenticated: false } as const;

interface LoginDto {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: UserPayload;
}

interface RegisterDto {
  readonly user: UserPayload;
  readonly nextStep?: string;
}

const emptyResponse = (what: string): AppError =>
  new AppError(`The ${what} response was empty.`, { code: ErrorCode.UNKNOWN });

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async signIn(identifier: string, password: string): Promise<AuthSession> {
    const dto = await this.http.post<LoginDto>('/auth/login', { identifier, password }, PUBLIC);
    if (!dto) throw emptyResponse('sign-in');
    return {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      user: toUser(dto.user),
    };
  }

  async signUp(details: RegistrationDetails): Promise<RegistrationResult> {
    const dto = await this.http.post<RegisterDto>('/auth/register', details, PUBLIC);
    if (!dto) throw emptyResponse('registration');
    return { user: toUser(dto.user), nextStep: dto.nextStep ?? 'verify_email' };
  }

  signOut(): Promise<unknown> {
    return this.http.post('/auth/logout');
  }

  async me(options: RequestOptions = {}): Promise<ReturnType<typeof toUser>> {
    return toUser(await this.http.get<UserPayload>('/auth/me', options));
  }

  async isHandleAvailable(handle: string, options: RequestOptions = {}): Promise<boolean> {
    const dto = await this.http.get<{ available?: boolean }>('/auth/handle-available', {
      ...options,
      ...PUBLIC,
      params: { handle },
    });
    return Boolean(dto?.available);
  }

  requestPasswordReset(email: string): Promise<unknown> {
    return this.http.post('/auth/password/forgot', { email }, PUBLIC);
  }
}
