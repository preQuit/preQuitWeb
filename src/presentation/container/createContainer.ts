import { apiConfig, type ApiConfig } from '../../data/config/apiConfig';
import { AxiosHttpClient } from '../../data/http/AxiosHttpClient';
import type { HttpClient } from '../../data/http/HttpClient';
import { HttpAuthRepository } from '../../data/repositories/HttpAuthRepository';
import { HttpFeedRepository } from '../../data/repositories/HttpFeedRepository';
import { HttpMessagingRepository } from '../../data/repositories/HttpMessagingRepository';
import { HttpPostRepository } from '../../data/repositories/HttpPostRepository';
import { HttpProfileRepository } from '../../data/repositories/HttpProfileRepository';
import { HttpSearchRepository } from '../../data/repositories/HttpSearchRepository';
import { HttpSocialRepository } from '../../data/repositories/HttpSocialRepository';
import { BrowserSessionRepository } from '../../data/storage/BrowserSessionRepository';

import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { FeedRepository } from '../../domain/repositories/FeedRepository';
import type { MessagingRepository } from '../../domain/repositories/MessagingRepository';
import type { PostRepository } from '../../domain/repositories/PostRepository';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import type { SearchRepository } from '../../domain/repositories/SearchRepository';
import type { SessionRepository } from '../../domain/repositories/SessionRepository';
import type { SocialRepository } from '../../domain/repositories/SocialRepository';

import { CheckHandleUseCase } from '../../application/auth/CheckHandleUseCase';
import { RequestPasswordResetUseCase } from '../../application/auth/RequestPasswordResetUseCase';
import { RestoreSessionUseCase } from '../../application/auth/RestoreSessionUseCase';
import { SignInUseCase } from '../../application/auth/SignInUseCase';
import { SignOutUseCase } from '../../application/auth/SignOutUseCase';
import { SignUpUseCase } from '../../application/auth/SignUpUseCase';
import { AddCommentUseCase } from '../../application/engagement/AddCommentUseCase';
import { LoadCommentsUseCase } from '../../application/engagement/LoadCommentsUseCase';
import { ToggleLikeUseCase } from '../../application/engagement/ToggleLikeUseCase';
import { ToggleSaveUseCase } from '../../application/engagement/ToggleSaveUseCase';
import { LoadFeedUseCase } from '../../application/feed/LoadFeedUseCase';
import { LoadConversationsUseCase } from '../../application/messaging/LoadConversationsUseCase';
import { LoadMessagesUseCase } from '../../application/messaging/LoadMessagesUseCase';
import { MarkConversationReadUseCase } from '../../application/messaging/MarkConversationReadUseCase';
import { OpenConversationUseCase } from '../../application/messaging/OpenConversationUseCase';
import { SendMessageUseCase } from '../../application/messaging/SendMessageUseCase';
import { LoadMyProfileUseCase } from '../../application/profile/LoadMyProfileUseCase';
import { LoadUserPostsUseCase } from '../../application/profile/LoadUserPostsUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { LoadTrendingTopicsUseCase } from '../../application/search/LoadTrendingTopicsUseCase';
import { SearchContentUseCase } from '../../application/search/SearchContentUseCase';

export interface Repositories {
  readonly auth: AuthRepository;
  readonly feed: FeedRepository;
  readonly post: PostRepository;
  readonly search: SearchRepository;
  readonly messaging: MessagingRepository;
  readonly profile: ProfileRepository;
  readonly social: SocialRepository;
}

export interface UseCases {
  readonly signIn: SignInUseCase;
  readonly signUp: SignUpUseCase;
  readonly signOut: SignOutUseCase;
  readonly restoreSession: RestoreSessionUseCase;
  readonly checkHandle: CheckHandleUseCase;
  readonly requestPasswordReset: RequestPasswordResetUseCase;
  readonly loadFeed: LoadFeedUseCase;
  readonly toggleLike: ToggleLikeUseCase;
  readonly toggleSave: ToggleSaveUseCase;
  readonly loadComments: LoadCommentsUseCase;
  readonly addComment: AddCommentUseCase;
  readonly search: SearchContentUseCase;
  readonly loadTrendingTopics: LoadTrendingTopicsUseCase;
  readonly loadConversations: LoadConversationsUseCase;
  readonly loadMessages: LoadMessagesUseCase;
  readonly sendMessage: SendMessageUseCase;
  readonly openConversation: OpenConversationUseCase;
  readonly markConversationRead: MarkConversationReadUseCase;
  readonly loadMyProfile: LoadMyProfileUseCase;
  readonly loadUserPosts: LoadUserPostsUseCase;
  readonly updateProfile: UpdateProfileUseCase;
}

export type Unsubscribe = () => void;

export interface AppContainer {
  readonly config: ApiConfig;
  readonly http: HttpClient;
  readonly session: SessionRepository;
  readonly repositories: Repositories;
  readonly useCases: UseCases;
  onSessionLost(listener: () => void): Unsubscribe;
}

export interface ContainerOptions {
  readonly config?: ApiConfig;
  readonly session?: SessionRepository;
}

const buildRepositories = (http: HttpClient): Repositories => ({
  auth: new HttpAuthRepository(http),
  feed: new HttpFeedRepository(http),
  post: new HttpPostRepository(http),
  search: new HttpSearchRepository(http),
  messaging: new HttpMessagingRepository(http),
  profile: new HttpProfileRepository(http),
  social: new HttpSocialRepository(http),
});

const buildUseCases = (repositories: Repositories, session: SessionRepository): UseCases => ({
  signIn: new SignInUseCase(repositories.auth, session),
  signUp: new SignUpUseCase(repositories.auth),
  signOut: new SignOutUseCase(repositories.auth, session),
  restoreSession: new RestoreSessionUseCase(repositories.auth, session),
  checkHandle: new CheckHandleUseCase(repositories.auth),
  requestPasswordReset: new RequestPasswordResetUseCase(repositories.auth),

  loadFeed: new LoadFeedUseCase(repositories.feed),
  toggleLike: new ToggleLikeUseCase(repositories.post),
  toggleSave: new ToggleSaveUseCase(repositories.post),
  loadComments: new LoadCommentsUseCase(repositories.post),
  addComment: new AddCommentUseCase(repositories.post),

  search: new SearchContentUseCase(repositories.search),
  loadTrendingTopics: new LoadTrendingTopicsUseCase(repositories.search),

  loadConversations: new LoadConversationsUseCase(repositories.messaging),
  loadMessages: new LoadMessagesUseCase(repositories.messaging),
  sendMessage: new SendMessageUseCase(repositories.messaging),
  openConversation: new OpenConversationUseCase(repositories.messaging),
  markConversationRead: new MarkConversationReadUseCase(repositories.messaging),

  loadMyProfile: new LoadMyProfileUseCase(repositories.profile),
  loadUserPosts: new LoadUserPostsUseCase(repositories.profile),
  updateProfile: new UpdateProfileUseCase(repositories.profile),
});

export const createContainer = (options: ContainerOptions = {}): AppContainer => {
  const config = options.config ?? apiConfig;
  const session = options.session ?? new BrowserSessionRepository();
  const listeners = new Set<() => void>();

  const http = new AxiosHttpClient({
    baseUrl: config.baseUrl,
    timeoutMs: config.requestTimeoutMs,
    session,
    onSessionLost: () => listeners.forEach(listener => listener()),
  });

  const repositories = buildRepositories(http);

  return {
    config,
    http,
    session,
    repositories,
    useCases: buildUseCases(repositories, session),
    onSessionLost(listener: () => void): Unsubscribe {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
