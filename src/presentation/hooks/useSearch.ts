'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import type { Topic } from '../../domain/entities/Topic';
import {
  emptySearchResults,
  type SearchResults,
} from '../../domain/repositories/SearchRepository';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const DEBOUNCE_MS = 280;

export interface SearchViewModel {
  readonly query: string;
  setQuery(next: string): void;
  clear(): void;
  readonly isActive: boolean;
  readonly isSearching: boolean;
  readonly results: SearchResults;
  readonly trendingTopics: readonly Topic[];
}

const useDebounced = (value: string, delayMs: number): string => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export const useSearch = (): SearchViewModel => {
  const useCases = useUseCases();
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, DEBOUNCE_MS);
  const isActive = debounced.length > 0;

  const trending = useQuery({
    queryKey: queryKeys.trendingTopics,
    queryFn: ({ signal }) => useCases.loadTrendingTopics.execute({ signal }),
    staleTime: 5 * 60_000,
  });

  const search = useQuery({
    queryKey: queryKeys.search(debounced),
    queryFn: ({ signal }) => useCases.search.execute(debounced, { signal }),
    enabled: isActive,
    placeholderData: previous => previous,
  });

  const results = useMemo(
    () => (isActive ? (search.data ?? emptySearchResults) : emptySearchResults),
    [isActive, search.data],
  );

  return {
    query,
    setQuery,
    clear: () => setQuery(''),
    isActive,
    isSearching: isActive && search.isFetching,
    results,
    trendingTopics: trending.data ?? [],
  };
};
