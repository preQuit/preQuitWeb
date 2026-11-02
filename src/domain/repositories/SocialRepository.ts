import type { User } from '../entities/User';
import type { Page, PageOptions, RequestOptions } from './common';

export const RelationshipState = {
  NONE: 'none',
  FOLLOWING: 'following',
  REQUESTED: 'requested',
  MUTUAL: 'mutual',
  BLOCKED: 'blocked',
  BLOCKED_BY: 'blocked_by',
} as const;

export type RelationshipStateValue = (typeof RelationshipState)[keyof typeof RelationshipState];

/**
 * `/users/:handle` and `/users/suggested` both return this full shape, but
 * `User.viewer` (domain/entities/User.ts) only models a subset of it. Read
 * this type via `viewerRelationshipOf` in application/social/relationship.ts
 * rather than widening the shared User entity from this phase.
 */
export interface ViewerRelationship {
  readonly isSelf: boolean;
  readonly relationship: RelationshipStateValue;
  readonly isMutual: boolean;
  readonly canMessage: boolean;
  readonly hasPendingRequestFromMe: boolean;
  readonly hasPendingRequestToMe: boolean;
  readonly isMuted: boolean;
  readonly isBlocked: boolean;
}

export interface FollowResult {
  readonly relationship: 'following' | 'requested';
  readonly isMutual: boolean;
  readonly requestId?: string;
}

export interface FollowEdgeEntry {
  readonly userId: string;
  readonly since: string;
  readonly user?: User | null;
}

export const FollowRequestDirection = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
} as const;

export type FollowRequestDirectionValue =
  (typeof FollowRequestDirection)[keyof typeof FollowRequestDirection];

export interface FollowRequestEntry {
  readonly id: string;
  readonly requesterId: string;
  readonly targetId: string;
  readonly createdAt: string;
}

export const MuteScope = {
  POSTS: 'posts',
  NOTIFICATIONS: 'notifications',
  ALL: 'all',
} as const;

export type MuteScopeValue = (typeof MuteScope)[keyof typeof MuteScope];

export interface SocialRepository {
  follow(userId: string): Promise<FollowResult>;
  unfollow(userId: string): Promise<void>;
  removeFollower(userId: string): Promise<void>;
  followers(userId: string, options?: PageOptions): Promise<Page<FollowEdgeEntry>>;
  following(userId: string, options?: PageOptions): Promise<Page<FollowEdgeEntry>>;
  mutuals(options?: RequestOptions): Promise<readonly string[]>;
  followRequests(
    direction: FollowRequestDirectionValue,
    options?: PageOptions,
  ): Promise<Page<FollowRequestEntry>>;
  acceptFollowRequest(requestId: string): Promise<void>;
  rejectFollowRequest(requestId: string): Promise<void>;
  cancelFollowRequest(requestId: string): Promise<void>;
  blocked(options?: RequestOptions): Promise<readonly string[]>;
  block(userId: string): Promise<void>;
  unblock(userId: string): Promise<void>;
  mute(userId: string, scope?: MuteScopeValue): Promise<void>;
  unmute(userId: string): Promise<void>;
  suggested(options?: PageOptions): Promise<readonly User[]>;
}
