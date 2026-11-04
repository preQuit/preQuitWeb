'use client';

import { Heart } from 'lucide-react';

import { EmptyState } from '../../components/EmptyState';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Spinner } from '../../components/Spinner';
import { useFollowMutuals } from '../../hooks/useFollowMutuals';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

export const FriendsScreen = () => {
  const { ids, isLoading } = useFollowMutuals();

  return (
    <main className="flex flex-col pt-10">
      <ScreenHeader title="Friends" backHref={SOCIAL_GRAPH_ROUTES.root} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : ids.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No friends yet"
          body="A friend is anyone who follows you back — follow a few people to get started."
        />
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {ids.map(id => (
            <PersonRow key={id} userId={id} />
          ))}
        </div>
      )}
    </main>
  );
};
