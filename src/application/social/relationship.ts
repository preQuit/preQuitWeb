import type { User } from '../../domain/entities/User';
import { RelationshipState, type ViewerRelationship } from '../../domain/repositories/SocialRepository';

/**
 * `User.viewer` (domain/entities/User.ts) only models `isSelf`, `relationship`
 * and `isMutual` — the wire payload from `/users/:handle` and
 * `/users/suggested` also carries `canMessage`, `isMuted`, `isBlocked` and the
 * `blocked_by` relationship value. Widening the shared entity is out of scope
 * for this phase, so every call site reads the richer shape through here
 * instead of trusting a narrower cast of its own.
 */
export const viewerRelationshipOf = (user: Pick<User, 'viewer'> | null | undefined): ViewerRelationship | null =>
  (user?.viewer as unknown as ViewerRelationship | null) ?? null;

export const isFollowable = (relationship: ViewerRelationship | null): boolean =>
  relationship !== null && !relationship.isSelf && relationship.relationship !== RelationshipState.BLOCKED_BY;
