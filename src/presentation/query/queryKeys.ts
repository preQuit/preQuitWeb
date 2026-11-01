import type { FeedSurfaceValue } from '../../domain/repositories/FeedRepository';
import type { FollowRequestDirectionValue } from '../../domain/repositories/SocialRepository';

export const queryKeys = {
  session: ['session'] as const,
  feed: (surface: FeedSurfaceValue) => ['feed', surface] as const,
  comments: (postId: string) => ['comments', postId] as const,
  search: (query: string) => ['search', query] as const,
  trendingTopics: ['search', 'trending'] as const,
  conversations: (viewerId: string | null) => ['conversations', viewerId] as const,
  messages: (conversationId: string, viewerId: string | null) =>
    ['messages', conversationId, viewerId] as const,
  myProfile: ['profile', 'me'] as const,
  userPosts: (userId: string) => ['profile', 'posts', userId] as const,
  handleAvailability: (handle: string) => ['auth', 'handle', handle] as const,
  userProfile: (handle: string) => ['profile', 'user', handle] as const,
  // Keyed by id rather than handle: a progressive-enhancement cache that lets
  // an id-only follower/following/mutual row borrow a richer card once that
  // user's full profile has been seen anywhere else in the app.
  userDirectory: (userId: string) => ['social', 'directory', userId] as const,
  followers: (userId: string) => ['social', 'followers', userId] as const,
  following: (userId: string) => ['social', 'following', userId] as const,
  mutuals: ['social', 'mutuals'] as const,
  followRequests: (direction: FollowRequestDirectionValue) =>
    ['social', 'follow-requests', direction] as const,
  blocked: ['social', 'blocked'] as const,
  suggested: ['social', 'suggested'] as const,
};
