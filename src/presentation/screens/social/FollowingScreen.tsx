'use client';

import { Users } from 'lucide-react';
import { useParams } from 'next/navigation';

import { EmptyState } from '../../components/EmptyState';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Spinner } from '../../components/Spinner';
import { useFollowingList } from '../../hooks/useFollowingList';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useSocialProfile } from '../../hooks/useSocialProfile';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

export const FollowingScreen = () => {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? '';
  const { user, isLoading: isLoadingProfile } = useSocialProfile(handle);
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useFollowingList(user?.id ?? null);
  const sentinel = useInfiniteScroll<HTMLDivElement>(loadMore, hasMore);

  return (
    <main className="flex flex-col pt-10">
      <ScreenHeader title={`@${handle} · Following`} backHref={SOCIAL_GRAPH_ROUTES.user(handle)} />

      {isLoading || isLoadingProfile ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="Not following anyone yet" />
      ) : (
        <>
          <div className="flex flex-col divide-y divide-line">
            {items.map(item => (
              <PersonRow key={item.userId} userId={item.userId} since={item.since} user={item.user ?? null} />
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
