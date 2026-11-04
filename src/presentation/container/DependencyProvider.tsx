'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

import type { RealtimeClient } from '../../data/realtime/RealtimeClient';
import { SocketIoRealtimeClient } from '../../data/realtime/SocketIoRealtimeClient';
import { createContainer, type AppContainer, type UseCases } from './createContainer';

const DependencyContext = createContext<AppContainer | null>(null);
const RealtimeClientContext = createContext<RealtimeClient | null>(null);

export interface DependencyProviderProps {
  readonly container?: AppContainer | null;
  readonly children: ReactNode;
}

export const DependencyProvider = ({ container = null, children }: DependencyProviderProps) => {
  const value = useMemo(() => container ?? createContainer(), [container]);

  const realtime = useMemo<RealtimeClient>(
    () => new SocketIoRealtimeClient({ url: value.config.realtimeUrl, session: value.session }),
    [value],
  );

  useEffect(() => () => realtime.forceDisconnect(), [realtime]);

  useEffect(() => value.onSessionLost(() => realtime.forceDisconnect()), [value, realtime]);

  return (
    <DependencyContext.Provider value={value}>
      <RealtimeClientContext.Provider value={realtime}>{children}</RealtimeClientContext.Provider>
    </DependencyContext.Provider>
  );
};

export const useDependencies = (): AppContainer => {
  const container = useContext(DependencyContext);
  if (!container) throw new Error('useDependencies must be used inside a DependencyProvider');
  return container;
};

export const useUseCases = (): UseCases => useDependencies().useCases;

export const useRealtimeClient = (): RealtimeClient => {
  const client = useContext(RealtimeClientContext);
  if (!client) throw new Error('useRealtimeClient must be used inside a DependencyProvider');
  return client;
};
