'use client';

import { UserMinus, Users } from 'lucide-react';
import { useParams } from 'next/navigation';

import { EmptyState } from '../../components/EmptyState';
import { GlassButton } from '../../components/GlassButton';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Spinner } from '../../components/Spinner';
import { useFollowersList } from '../../hooks/useFollowersList';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useSession } from '../../hooks/useSession';
import { useSocialProfile } from '../../hooks/useSocialProfile';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

export const FollowersScreen = () => {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? '';
  const { user: viewer } = useSession();
  const { user, isLoading: isLoadingProfile } = useSocialProfile(handle);
  const { items, isLoading, isLoadingMore, hasMore, loadMore, removeFollower, isRemoving } =
    useFollowersList(user?.id ?? null);
  const sentinel = useInfiniteScroll<HTMLDivElement>(loadMore, hasMore);

  const canManage = Boolean(viewer && user && viewer.id === user.id);

  return (
    <main className="flex flex-col pt-10">
      <ScreenHeader title={`@${handle} · Followers`} backHref={SOCIAL_GRAPH_ROUTES.user(handle)} />

      {isLoading || isLoadingProfile ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No followers yet" body="Nobody is following this account yet." />
      ) : (
        <>
          <div className="flex flex-col divide-y divide-line">
            {items.map(item => (
              <PersonRow
                key={item.userId}
                userId={item.userId}
                since={item.since}
                trailing={
                  canManage ? (
                    <GlassButton
                      tone="quiet"
                      size="control"
                      disabled={isRemoving}
                      onClick={() => removeFollower(item.userId)}
                    >
                      <UserMinus size={14} />
                      Remove
                    </GlassButton>
                  ) : null
                }
              />
            ))}
          </div>
          <div ref={sentinel} aria-hidden className="h-px" />
          {isLoadingMore ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : null}
        </>
      )}
    </main>
  );
};
