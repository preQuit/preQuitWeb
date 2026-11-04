'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { viewerRelationshipOf } from '../../application/social/relationship';
import type { User } from '../../domain/entities/User';
import {
  RelationshipState,
  type RelationshipStateValue,
  type ViewerRelationship,
} from '../../domain/repositories/SocialRepository';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

export interface FollowActionViewModel {
  readonly relationship: RelationshipStateValue | null;
  readonly isHidden: boolean;
  readonly isBusy: boolean;
  readonly isConfirmingUnfollow: boolean;
  cancelUnfollowConfirm(): void;
  act(): void;
}

const patchViewer = (user: User, patch: Partial<ViewerRelationship>): User => {
  const current = viewerRelationshipOf(user);
  if (!current) return user;
  return { ...user, viewer: { ...current, ...patch } as unknown as User['viewer'] };
};

const OUTGOING_REQUEST_SCAN_LIMIT = 100;

/**
 * Drives every FollowButton in the app. Takes the full `User` so it can read
 * `isPrivate` (to predict follow vs. request) and patches every cache that
 * might be holding a copy of this same user — the by-handle profile query,
 * the suggested list, and the cross-screen user directory — matching the
 * optimistic-with-rollback pattern in useFeed.ts.
 */
export const useFollowAction = (user: User | null): FollowActionViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const snapshotRef = useRef<Partial<ViewerRelationship> | null>(null);

  const userId = user?.id ?? '';
  const relationship = viewerRelationshipOf(user);

  const patchEverywhere = useCallback(
    (patch: Partial<ViewerRelationship>) => {
      if (!userId) return;
      queryClient.setQueriesData<User>({ queryKey: queryKeys.userDirectory(userId) }, data =>
        data ? patchViewer(data, patch) : data,
      );
      queryClient.setQueriesData<readonly User[]>({ queryKey: queryKeys.suggested }, list =>
        list?.map(item => (item.id === userId ? patchViewer(item, patch) : item)),
      );
      queryClient.setQueriesData<User>({ queryKey: ['profile', 'user'], exact: false }, data =>
        data && data.id === userId ? patchViewer(data, patch) : data,
      );
    },
    [queryClient, userId],
  );

  const resolveOutgoingRequestId = async (): Promise<string | null> => {
    const page = await useCases.loadFollowRequests.execute('outgoing', {
      limit: OUTGOING_REQUEST_SCAN_LIMIT,
    });
    return page.items.find(item => item.targetId === userId)?.id ?? null;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!relationship) return;
      switch (relationship.relationship) {
        case RelationshipState.NONE: {
          const result = await useCases.followUser.execute(userId);
          // FollowResultDto's `relationship` can only be 'following' | 'requested' —
          // it never reports 'mutual' itself, even when `isMutual` is true (following
          // someone who already follows you back). Promote it here so the button
          // shows "Friends" immediately instead of "Following" until the next refetch.
          const resolved = result.isMutual ? RelationshipState.MUTUAL : result.relationship;
          patchEverywhere({
            relationship: resolved,
            isMutual: result.isMutual,
            hasPendingRequestFromMe: result.relationship === RelationshipState.REQUESTED,
            canMessage: resolved === RelationshipState.MUTUAL ? true : relationship.canMessage,
          });
          return;
        }
        case RelationshipState.FOLLOWING:
        case RelationshipState.MUTUAL:
          await useCases.unfollowUser.execute(userId);
          return;
        case RelationshipState.REQUESTED: {
          const requestId = await resolveOutgoingRequestId();
          if (!requestId) throw new Error('Could not find that pending request — it may have just been accepted or rejected.');
          await useCases.cancelFollowRequest.execute(requestId);
          return;
        }
        case RelationshipState.BLOCKED:
          await useCases.unblockUser.execute(userId);
          return;
        default:
          return;
      }
    },
    onMutate: () => {
      if (!relationship) return;
      setConfirming(false);
      snapshotRef.current = { ...relationship };

      if (relationship.relationship === RelationshipState.NONE) {
        const predicted = user?.isPrivate ? RelationshipState.REQUESTED : RelationshipState.FOLLOWING;
        patchEverywhere({
          relationship: predicted,
          hasPendingRequestFromMe: predicted === RelationshipState.REQUESTED,
        });
        return;
      }

      patchEverywhere({
        relationship: RelationshipState.NONE,
        isMutual: false,
        hasPendingRequestFromMe: false,
        canMessage: false,
      });
    },
    onError: () => {
      if (snapshotRef.current) patchEverywhere(snapshotRef.current);
    },
  });

  return {
    relationship: relationship?.relationship ?? null,
    isHidden: !relationship || relationship.isSelf || relationship.relationship === RelationshipState.BLOCKED_BY,
    isBusy: mutation.isPending,
    isConfirmingUnfollow: confirming,
    cancelUnfollowConfirm: () => setConfirming(false),
    act: () => {
      if (!relationship || mutation.isPending) return;
      if (relationship.relationship === RelationshipState.MUTUAL && !confirming) {
        setConfirming(true);
        return;
      }
      mutation.mutate();
    },
  };
};
