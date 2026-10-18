'use client';

import type { ReactNode } from 'react';

import { DependencyProvider } from '@/src/presentation/container/DependencyProvider';
import { SessionProvider } from '@/src/presentation/hooks/useSession';
import { QueryProvider } from '@/src/presentation/query/QueryProvider';

export interface ProvidersProps {
  readonly children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  <DependencyProvider>
    <QueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </QueryProvider>
  </DependencyProvider>
);
