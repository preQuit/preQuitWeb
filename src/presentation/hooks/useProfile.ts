'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Post } from '../../domain/entities/Post';
import type { User } from '../../domain/entities/User';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSession } from './useSession';

export interface ProfileViewModel {
  readonly profile: User | null;
  readonly posts: readonly Post[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly error: unknown;
  refresh(): void;
  deletePost(postId: string): void;
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

  return {
    profile: profile.data ?? null,
    posts: posts.data ?? [],
    isLoading: profile.isPending,
    isRefreshing: profile.isFetching && !profile.isPending,
    error: profile.error,
    refresh: () => {
      void profile.refetch();
      void posts.refetch();
    },
    deletePost: postId => deleteMutation.mutate(postId),
  };
};
