'use client';

import { useQuery } from '@tanstack/react-query';

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
}

export const useMyProfile = (): ProfileViewModel => {
  const useCases = useUseCases();
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
  };
};
