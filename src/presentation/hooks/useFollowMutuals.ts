'use client';

import { useQuery } from '@tanstack/react-query';

import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

export interface FollowMutualsViewModel {
  readonly ids: readonly string[];
  readonly isLoading: boolean;
  readonly error: unknown;
}

export const useFollowMutuals = (): FollowMutualsViewModel => {
  const useCases = useUseCases();

  const query = useQuery({
    queryKey: queryKeys.mutuals,
    queryFn: ({ signal }) => useCases.loadMutuals.execute({ signal }),
  });

  return {
    ids: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
  };
};
