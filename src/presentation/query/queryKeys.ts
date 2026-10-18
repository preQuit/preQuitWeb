import type { FeedSurfaceValue } from '../../domain/repositories/FeedRepository';

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
};
