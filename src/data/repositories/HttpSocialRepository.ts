import type { User, UserPayload } from '../../domain/entities/User';
import type { SocialRepository } from '../../domain/repositories/SocialRepository';
import type { PageOptions, RequestOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { toUserList } from '../mappers/UserMapper';

export class HttpSocialRepository implements SocialRepository {
  constructor(private readonly http: HttpClient) {}

  follow(userId: string): Promise<unknown> {
    return this.http.post(`/users/${userId}/follow`);
  }

  unfollow(userId: string): Promise<unknown> {
    return this.http.delete(`/users/${userId}/follow`);
  }

  async mutuals(options: RequestOptions = {}): Promise<readonly string[]> {
    const dto = await this.http.get<readonly string[]>('/me/mutuals', options);
    return Array.isArray(dto) ? dto : [];
  }

  async suggested(options: PageOptions = {}): Promise<readonly User[]> {
    const { limit = 20, signal } = options;
    const dto = await this.http.get<readonly UserPayload[]>('/users/suggested', {
      params: { limit },
      ...(signal ? { signal } : {}),
    });
    return toUserList(dto ?? []);
  }
}
