'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Post } from '../../domain/entities/Post';
import type { PrivacySettings, User } from '../../domain/entities/User';
import { messageOf } from '../../domain/errors/AppError';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSession } from './useSession';

export interface ProfileViewModel {
  readonly profile: User | null;
  readonly posts: readonly Post[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly error: unknown;
  /** Set while either privacy mutation is in flight. */
  readonly isSavingPrivacy: boolean;
  readonly privacyError: string | null;
  refresh(): void;
  deletePost(postId: string): void;
  setAccountPrivate(isPrivate: boolean): Promise<boolean>;
  updatePrivacy(patch: Partial<PrivacySettings>): Promise<boolean>;
}

export const useMyProfile = (): ProfileViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const { isSignedIn } = useSession();

  const profile = useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: ({ signal }) => useCases.loadMyProfile.execute({ signal }),
    enabled: isSignedIn,
  });

  const userId = profile.data?.id ?? '';

  const posts = useQuery({
    queryKey: queryKeys.userPosts(userId),
    queryFn: ({ signal }) => useCases.loadUserPosts.execute(userId, { signal }),
    enabled: Boolean(userId),
  });

  const postsKey = queryKeys.userPosts(userId);

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => useCases.deletePost.execute(postId),
    onMutate: postId => {
      const previous = queryClient.getQueryData<readonly Post[]>(postsKey);
      queryClient.setQueryData<readonly Post[]>(postsKey, current =>
        (current ?? []).filter(post => post.id !== postId),
      );
      return { previous };
    },
    onError: (_error, _postId, context) => {
      if (context?.previous) queryClient.setQueryData(postsKey, context.previous);
    },
    // The post count on the profile header is server-owned, so it only settles
    // once the profile itself is refetched.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
    },
  });

  // Both mutators re-read the profile instead of patching local state, so the
  // screen can never show a privacy state the server did not accept.
  const visibilityMutation = useMutation({
    mutationFn: (isPrivate: boolean) => useCases.updateProfile.execute({ isPrivate }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.myProfile }),
  });

  const privacyMutation = useMutation({
    mutationFn: (patch: Partial<PrivacySettings>) => useCases.updatePrivacySettings.execute(patch),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.myProfile }),
  });

  const isSavingPrivacy = visibilityMutation.isPending || privacyMutation.isPending;
  const privacyError = messageOf(visibilityMutation.error ?? privacyMutation.error, '') || null;

  return {
    profile: profile.data ?? null,
    posts: posts.data ?? [],
    isLoading: profile.isPending,
    isRefreshing: profile.isFetching && !profile.isPending,
    error: profile.error,
    isSavingPrivacy,
    privacyError,
    refresh: () => {
      void profile.refetch();
      void posts.refetch();
    },
    deletePost: postId => deleteMutation.mutate(postId),
    setAccountPrivate: async isPrivate => {
      try {
        await visibilityMutation.mutateAsync(isPrivate);
        return true;
      } catch {
        return false;
      }
    },
    updatePrivacy: async patch => {
      try {
        await privacyMutation.mutateAsync(patch);
        return true;
      } catch {
        return false;
      }
    },
  };
};
