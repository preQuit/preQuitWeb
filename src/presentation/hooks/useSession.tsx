'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';

import {
  SessionStatus,
  type RestoredSession,
  type SessionStatusValue,
} from '../../application/auth/RestoreSessionUseCase';
import type { User } from '../../domain/entities/User';
import type {
  RegistrationDetails,
  RegistrationResult,
} from '../../domain/repositories/AuthRepository';
import { useDependencies } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

const SIGNED_OUT: RestoredSession = { status: SessionStatus.SIGNED_OUT, user: null };

export interface Credentials {
  readonly identifier: string;
  readonly password: string;
}

export interface SessionContextValue {
  readonly user: User | null;
  readonly viewerId: string | null;
  readonly status: SessionStatusValue;
  readonly isRestoring: boolean;
  readonly isSignedIn: boolean;
  readonly isSigningIn: boolean;
  readonly isSigningUp: boolean;
  signIn(credentials: Credentials): Promise<User>;
  signUp(details: RegistrationDetails): Promise<RegistrationResult>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  readonly children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const { useCases, onSessionLost } = useDependencies();
  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: queryKeys.session,
    queryFn: () => useCases.restoreSession.execute(),
    staleTime: Infinity,
    retry: false,
  });

  const setSession = useCallback(
    (next: RestoredSession) => queryClient.setQueryData(queryKeys.session, next),
    [queryClient],
  );

  useEffect(
    () =>
      onSessionLost(() => {
        queryClient.clear();
        setSession(SIGNED_OUT);
      }),
    [onSessionLost, queryClient, setSession],
  );

  const signInMutation = useMutation({
    mutationFn: ({ identifier, password }: Credentials) =>
      useCases.signIn.execute(identifier, password),
    onSuccess: user => setSession({ status: SessionStatus.SIGNED_IN, user }),
  });

  const signUpMutation = useMutation({
    mutationFn: (details: RegistrationDetails) => useCases.signUp.execute(details),
  });

  const signOutMutation = useMutation({
    mutationFn: () => useCases.signOut.execute(),
    onSettled: () => {
      queryClient.clear();
      setSession(SIGNED_OUT);
    },
  });

  const value = useMemo<SessionContextValue>(() => {
    const restored = session.data ?? SIGNED_OUT;
    return {
      user: restored.user,
      viewerId: restored.user?.id ?? null,
      status: restored.status,
      isRestoring: session.isPending,
      isSignedIn: restored.status === SessionStatus.SIGNED_IN,
      isSigningIn: signInMutation.isPending,
      isSigningUp: signUpMutation.isPending,
      signIn: credentials => signInMutation.mutateAsync(credentials),
      signUp: details => signUpMutation.mutateAsync(details),
      signOut: async () => {
        await signOutMutation.mutateAsync();
      },
    };
  }, [session.data, session.isPending, signInMutation, signUpMutation, signOutMutation]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextValue => {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside a SessionProvider');
  return session;
};
