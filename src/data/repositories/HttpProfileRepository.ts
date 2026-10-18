import type { Post } from '../../domain/entities/Post';
import type { User, UserPayload } from '../../domain/entities/User';
import type { ProfilePatch, ProfileRepository } from '../../domain/repositories/ProfileRepository';
import type { PageOptions, RequestOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { toPostList, type RankedEntry } from '../mappers/PostMapper';
import { toUser } from '../mappers/UserMapper';

export class HttpProfileRepository implements ProfileRepository {
  constructor(private readonly http: HttpClient) {}

  async myProfile(options: RequestOptions = {}): Promise<User> {
    return toUser(await this.http.get<UserPayload>('/me/profile', options));
  }

  async byHandle(handle: string, options: RequestOptions = {}): Promise<User> {
    return toUser(
      await this.http.get<UserPayload>(`/users/${encodeURIComponent(handle)}`, options),
    );
  }

  async postsOf(userId: string, options: PageOptions = {}): Promise<readonly Post[]> {
    const { limit = 20, before, signal } = options;
    const page = await this.http.getPage<RankedEntry>(`/users/${userId}/posts`, {
      params: { limit, before },
      ...(signal ? { signal } : {}),
    });
    return toPostList(page.items);
  }

  updateProfile(patch: ProfilePatch): Promise<unknown> {
    return this.http.patch('/me/profile', patch);
  }
}
