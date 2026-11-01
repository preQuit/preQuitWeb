'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { User } from '../../domain/entities/User';
import { queryKeys } from '../query/queryKeys';

/**
 * Followers, following and mutuals come back from the API as bare user ids —
 * there is no batch "users by id" endpoint to hydrate them with. This cache
 * lets a row borrow a full card for free once that user's profile has been
 * loaded anywhere else (a profile visit, the suggested list), without ever
 * promising a richer row than the backend can actually back today.
 */
export const useSocialUserDirectoryWriter = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (users: readonly User[]) => {
      users.forEach(user => {
        if (user.id) queryClient.setQueryData(queryKeys.userDirectory(user.id), user);
      });
    },
    [queryClient],
  );
};

export const useKnownUser = (userId: string): User | null => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<User>(queryKeys.userDirectory(userId)) ?? null;
};
