'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { User } from '../../domain/entities/User';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSocialUserDirectoryWriter } from './useSocialUserDirectory';

export interface SocialProfileViewModel {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly error: unknown;
}

export const useSocialProfile = (handle: string | null): SocialProfileViewModel => {
  const useCases = useUseCases();
  const rememberUser = useSocialUserDirectoryWriter();

  const query = useQuery({
    queryKey: queryKeys.userProfile(handle ?? ''),
    queryFn: ({ signal }) => useCases.loadUserProfile.execute(handle ?? '', { signal }),
    enabled: Boolean(handle),
  });

  useEffect(() => {
    if (query.data) rememberUser([query.data]);
  }, [query.data, rememberUser]);

  return {
    user: query.data ?? null,
    isLoading: query.isPending && Boolean(handle),
    error: query.error,
  };
};
