import { apiConfig, type ApiConfig } from '../../data/config/apiConfig';
import { AxiosHttpClient } from '../../data/http/AxiosHttpClient';
import type { HttpClient } from '../../data/http/HttpClient';
import { HttpAuthRepository } from '../../data/repositories/HttpAuthRepository';
import { CreatePostUseCase } from '../../application/feed/CreatePostUseCase';
import { HttpComposerRepository } from '../../data/repositories/HttpComposerRepository';
import { HttpFeedRepository } from '../../data/repositories/HttpFeedRepository';
import { HttpMessagingRepository } from '../../data/repositories/HttpMessagingRepository';
import { HttpPostRepository } from '../../data/repositories/HttpPostRepository';
import { HttpProfileRepository } from '../../data/repositories/HttpProfileRepository';
import { HttpSearchRepository } from '../../data/repositories/HttpSearchRepository';
import { HttpSocialRepository } from '../../data/repositories/HttpSocialRepository';
import { BrowserSessionRepository } from '../../data/storage/BrowserSessionRepository';

import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { ComposerRepository } from '../../domain/repositories/ComposerRepository';
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
import { ConversationActionsUseCase } from '../../application/messaging/ConversationActionsUseCase';
import { MessageActionsUseCase } from '../../application/messaging/MessageActionsUseCase';
import { DeletePostUseCase } from '../../application/content/DeletePostUseCase';
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
import { UpdatePrivacySettingsUseCase } from '../../application/profile/UpdatePrivacySettingsUseCase';
import { LoadTrendingTopicsUseCase } from '../../application/search/LoadTrendingTopicsUseCase';
import { SearchContentUseCase } from '../../application/search/SearchContentUseCase';
import { AcceptFollowRequestUseCase } from '../../application/social/AcceptFollowRequestUseCase';
import { BlockUserUseCase } from '../../application/social/BlockUserUseCase';
import { CancelFollowRequestUseCase } from '../../application/social/CancelFollowRequestUseCase';
import { FollowUserUseCase } from '../../application/social/FollowUserUseCase';
import { LoadBlockedUseCase } from '../../application/social/LoadBlockedUseCase';
import { LoadFollowersUseCase } from '../../application/social/LoadFollowersUseCase';
import { LoadFollowingUseCase } from '../../application/social/LoadFollowingUseCase';
import { LoadFollowRequestsUseCase } from '../../application/social/LoadFollowRequestsUseCase';
import { LoadMutualsUseCase } from '../../application/social/LoadMutualsUseCase';
import { LoadSuggestedUseCase } from '../../application/social/LoadSuggestedUseCase';
import { LoadUserProfileUseCase } from '../../application/social/LoadUserProfileUseCase';
import { MuteUserUseCase } from '../../application/social/MuteUserUseCase';
import { RejectFollowRequestUseCase } from '../../application/social/RejectFollowRequestUseCase';
import { RemoveFollowerUseCase } from '../../application/social/RemoveFollowerUseCase';
import { UnblockUserUseCase } from '../../application/social/UnblockUserUseCase';
import { UnfollowUserUseCase } from '../../application/social/UnfollowUserUseCase';
import { UnmuteUserUseCase } from '../../application/social/UnmuteUserUseCase';

export interface Repositories {
  readonly auth: AuthRepository;
  readonly feed: FeedRepository;
  readonly post: PostRepository;
  readonly composer: ComposerRepository;
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
  readonly createPost: CreatePostUseCase;
  readonly toggleLike: ToggleLikeUseCase;
  readonly toggleSave: ToggleSaveUseCase;
  readonly loadComments: LoadCommentsUseCase;
  readonly deletePost: DeletePostUseCase;
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
  readonly updatePrivacySettings: UpdatePrivacySettingsUseCase;
  readonly loadUserProfile: LoadUserProfileUseCase;
  readonly followUser: FollowUserUseCase;
  readonly unfollowUser: UnfollowUserUseCase;
  readonly removeFollower: RemoveFollowerUseCase;
  readonly loadFollowers: LoadFollowersUseCase;
  readonly loadFollowing: LoadFollowingUseCase;
  readonly loadMutuals: LoadMutualsUseCase;
  readonly loadSuggested: LoadSuggestedUseCase;
  readonly conversationActions: ConversationActionsUseCase;
  readonly messageActions: MessageActionsUseCase;
  readonly loadFollowRequests: LoadFollowRequestsUseCase;
  readonly acceptFollowRequest: AcceptFollowRequestUseCase;
  readonly rejectFollowRequest: RejectFollowRequestUseCase;
  readonly cancelFollowRequest: CancelFollowRequestUseCase;
  readonly loadBlocked: LoadBlockedUseCase;
  readonly blockUser: BlockUserUseCase;
  readonly unblockUser: UnblockUserUseCase;
  readonly muteUser: MuteUserUseCase;
  readonly unmuteUser: UnmuteUserUseCase;
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
  composer: new HttpComposerRepository(http),
  search: new HttpSearchRepository(http),
  messaging: new HttpMessagingRepository(http),
  profile: new HttpProfileRepository(http),
  social: new HttpSocialRepository(http),
});

const buildUseCases = (repositories: Repositories, session: SessionRepository): UseCases => ({
  createPost: new CreatePostUseCase(repositories.composer),
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
  deletePost: new DeletePostUseCase(repositories.post),
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
  updatePrivacySettings: new UpdatePrivacySettingsUseCase(repositories.profile),
  loadUserProfile: new LoadUserProfileUseCase(repositories.profile),

  followUser: new FollowUserUseCase(repositories.social),
  unfollowUser: new UnfollowUserUseCase(repositories.social),
  removeFollower: new RemoveFollowerUseCase(repositories.social),
  loadFollowers: new LoadFollowersUseCase(repositories.social),
  loadFollowing: new LoadFollowingUseCase(repositories.social),
  loadMutuals: new LoadMutualsUseCase(repositories.social),
  loadSuggested: new LoadSuggestedUseCase(repositories.social),
  conversationActions: new ConversationActionsUseCase(repositories.messaging, repositories.social),
  messageActions: new MessageActionsUseCase(repositories.messaging),
  loadFollowRequests: new LoadFollowRequestsUseCase(repositories.social),
  acceptFollowRequest: new AcceptFollowRequestUseCase(repositories.social),
  rejectFollowRequest: new RejectFollowRequestUseCase(repositories.social),
  cancelFollowRequest: new CancelFollowRequestUseCase(repositories.social),
  loadBlocked: new LoadBlockedUseCase(repositories.social),
  blockUser: new BlockUserUseCase(repositories.social),
  unblockUser: new UnblockUserUseCase(repositories.social),
  muteUser: new MuteUserUseCase(repositories.social),
  unmuteUser: new UnmuteUserUseCase(repositories.social),
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
