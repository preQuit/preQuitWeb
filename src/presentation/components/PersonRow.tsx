'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import type { User } from '../../domain/entities/User';
import { useKnownUser } from '../hooks/useSocialUserDirectory';
import { formatRelative } from '../format';
import { SOCIAL_GRAPH_ROUTES } from '../navigation/socialRoutes';
import { Avatar } from './Avatar';

export interface PersonRowProps {
  readonly userId: string;
  readonly since?: string | null;
  readonly user?: User | null;
  readonly trailing?: ReactNode;
}

/**
 * Followers, following and mutuals arrive from the API as bare ids — there is
 * no batch "users by id" endpoint. When a richer copy of this id has not been
 * seen elsewhere (useSocialUserDirectory), the row degrades honestly instead
 * of fabricating a name: no profile link, a generic avatar, just the action.
 */
export const PersonRow = ({ userId, since, user: provided, trailing }: PersonRowProps) => {
  const known = useKnownUser(userId);
  const user = provided ?? known;

  const name = user?.displayName || user?.handle || 'Member';
  const meta = user?.handle ? `@${user.handle}` : since ? `Since ${formatRelative(since)}` : 'Profile unavailable';

  const identity = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar name={name} url={user?.avatarUrl} size="md" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[14px] font-semibold text-paper">{name}</span>
        <span className="truncate text-[12px] text-muted">{meta}</span>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 px-5 py-3">
      {user?.handle ? (
        <Link href={SOCIAL_GRAPH_ROUTES.user(user.handle)} className="flex min-w-0 flex-1">
          {identity}
        </Link>
      ) : (
        identity
      )}
      {trailing}
    </div>
  );
};
