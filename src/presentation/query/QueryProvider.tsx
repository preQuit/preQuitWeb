'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { isAppError } from '../../domain/errors/AppError';

const MAX_RETRIES = 2;

const shouldRetry = (attempt: number, error: unknown): boolean => {
  if (attempt >= MAX_RETRIES) return false;
  return isAppError(error) ? error.isRetryable : false;
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: { retry: false },
    },
  });

export interface QueryProviderProps {
  readonly children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
