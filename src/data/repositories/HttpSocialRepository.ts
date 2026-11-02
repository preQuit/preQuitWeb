import type { User, UserPayload } from '../../domain/entities/User';
import type {
  FollowEdgeEntry,
  FollowRequestDirectionValue,
  FollowRequestEntry,
  FollowResult,
  MuteScopeValue,
  SocialRepository,
} from '../../domain/repositories/SocialRepository';
import type { Page, PageOptions, RequestOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { createUser } from '../../domain/entities/User';
import { toUserList } from '../mappers/UserMapper';

interface FollowerEdgeDto {
  readonly followerId: string;
  readonly createdAt: string;
  readonly user?: UserPayload | null;
}

interface FollowingEdgeDto {
  readonly followeeId: string;
  readonly createdAt: string;
  readonly user?: UserPayload | null;
}

// The blocks endpoint serializes the domain UserId instance as-is instead of
// its string value, so an entry can arrive as `{ _value }` — tolerate both
// shapes rather than depending on a backend fix for this phase.
type BlockedIdDto = string | { readonly _value?: string };

const idOf = (raw: BlockedIdDto): string => (typeof raw === 'string' ? raw : (raw._value ?? ''));

export class HttpSocialRepository implements SocialRepository {
  constructor(private readonly http: HttpClient) {}

  async follow(userId: string): Promise<FollowResult> {
    const result = await this.http.post<FollowResult>(`/users/${userId}/follow`);
    return result ?? { relationship: 'following', isMutual: false };
  }

  async unfollow(userId: string): Promise<void> {
    await this.http.delete(`/users/${userId}/follow`);
  }

  async removeFollower(userId: string): Promise<void> {
    await this.http.delete(`/me/followers/${userId}`);
  }

  async followers(userId: string, options: PageOptions = {}): Promise<Page<FollowEdgeEntry>> {
    const { limit = 20, before, signal } = options;
    const page = await this.http.getPage<FollowerEdgeDto>(`/users/${userId}/followers`, {
      params: { limit, before },
      ...(signal ? { signal } : {}),
    });
    return {
      items: page.items.map(row => ({
        userId: row.followerId,
        since: row.createdAt,
        user: row.user ? createUser(row.user) : null,
      })),
      nextCursor: page.nextCursor,
    };
  }

  async following(userId: string, options: PageOptions = {}): Promise<Page<FollowEdgeEntry>> {
    const { limit = 20, before, signal } = options;
    const page = await this.http.getPage<FollowingEdgeDto>(`/users/${userId}/following`, {
      params: { limit, before },
      ...(signal ? { signal } : {}),
    });
    return {
      items: page.items.map(row => ({
        userId: row.followeeId,
        since: row.createdAt,
        user: row.user ? createUser(row.user) : null,
      })),
      nextCursor: page.nextCursor,
    };
  }

  async mutuals(options: RequestOptions = {}): Promise<readonly string[]> {
    const dto = await this.http.get<readonly (string | UserPayload)[]>('/me/mutuals', options);
    if (!Array.isArray(dto)) return [];
    return dto.map(row => (typeof row === 'string' ? row : (row.id ?? ''))).filter(Boolean);
  }

  followRequests(
    direction: FollowRequestDirectionValue,
    options: PageOptions = {},
  ): Promise<Page<FollowRequestEntry>> {
    const { limit = 20, before, signal } = options;
    return this.http.getPage<FollowRequestEntry>('/me/follow-requests', {
      params: { direction, limit, before },
      ...(signal ? { signal } : {}),
    });
  }

  async acceptFollowRequest(requestId: string): Promise<void> {
    await this.http.post(`/me/follow-requests/${requestId}/accept`);
  }

  async rejectFollowRequest(requestId: string): Promise<void> {
    await this.http.post(`/me/follow-requests/${requestId}/reject`);
  }

  async cancelFollowRequest(requestId: string): Promise<void> {
    await this.http.delete(`/me/follow-requests/${requestId}`);
  }

  async blocked(options: RequestOptions = {}): Promise<readonly string[]> {
    const dto = await this.http.get<readonly BlockedIdDto[]>('/me/blocks', options);
    return Array.isArray(dto) ? dto.map(idOf).filter(Boolean) : [];
  }

  async block(userId: string): Promise<void> {
    await this.http.post(`/users/${userId}/block`);
  }

  async unblock(userId: string): Promise<void> {
    await this.http.delete(`/users/${userId}/block`);
  }

  async mute(userId: string, scope: MuteScopeValue = 'posts'): Promise<void> {
    await this.http.post(`/users/${userId}/mute`, { scope });
  }

  async unmute(userId: string): Promise<void> {
    await this.http.delete(`/users/${userId}/mute`);
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
