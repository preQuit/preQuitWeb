'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import type { User } from '../../domain/entities/User';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const DEBOUNCE_MS = 280;

export interface PeopleLookup {
  readonly people: readonly User[];
  readonly isSearching: boolean;
}

export interface PeopleSearchViewModel extends PeopleLookup {
  readonly query: string;
  setQuery(next: string): void;
  clear(): void;
  readonly isActive: boolean;
  readonly suggested: readonly User[];
}

const useDebounced = (value: string, delayMs: number): string => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

/**
 * People-only view of the same /search endpoint the topic/post search uses.
 * Takes the query from the caller so a screen that already owns a search box
 * (the chats list) can reuse it without a second input.
 */
export const usePeopleSearch = (externalQuery: string): PeopleLookup => {
  const useCases = useUseCases();
  const debounced = useDebounced(externalQuery, DEBOUNCE_MS);
  const isActive = debounced.length > 0;

  const search = useQuery({
    queryKey: queryKeys.search(debounced),
    queryFn: ({ signal }) => useCases.search.execute(debounced, { signal }),
    enabled: isActive,
    placeholderData: previous => previous,
  });

  return {
    people: isActive ? (search.data?.people ?? []) : [],
    isSearching: isActive && search.isFetching,
  };
};

/** The /people screen: owns its own query box and falls back to suggestions. */
export const usePeopleDirectory = (): PeopleSearchViewModel => {
  const useCases = useUseCases();
  const [query, setQuery] = useState('');
  const lookup = usePeopleSearch(query);

  const suggested = useQuery({
    queryKey: queryKeys.suggested,
    queryFn: ({ signal }) => useCases.loadSuggested.execute({ signal }),
    staleTime: 5 * 60_000,
  });

  return {
    ...lookup,
    query,
    setQuery,
    clear: () => setQuery(''),
    isActive: query.trim().length > 0,
    suggested: suggested.data ?? [],
  };
};
