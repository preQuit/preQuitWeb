'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { User } from '../../domain/entities/User';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useSocialUserDirectoryWriter } from './useSocialUserDirectory';

export interface SocialSuggestedViewModel {
  readonly people: readonly User[];
  readonly isLoading: boolean;
  readonly error: unknown;
  refresh(): void;
}

const SUGGESTED_LIMIT = 30;

export const useSocialSuggested = (): SocialSuggestedViewModel => {
  const useCases = useUseCases();
  const rememberUsers = useSocialUserDirectoryWriter();

  const query = useQuery({
    queryKey: queryKeys.suggested,
    queryFn: ({ signal }) => useCases.loadSuggested.execute({ limit: SUGGESTED_LIMIT, signal }),
  });

  useEffect(() => {
    if (query.data) rememberUsers(query.data);
  }, [query.data, rememberUsers]);

  return {
    people: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
    refresh: () => void query.refetch(),
  };
};
