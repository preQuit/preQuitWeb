'use client';

import { RefreshCw, Sparkles } from 'lucide-react';

import { messageOf } from '../../../domain/errors/AppError';
import { EmptyState } from '../../components/EmptyState';
import { FollowButton } from '../../components/FollowButton';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Spinner } from '../../components/Spinner';
import { useSocialSuggested } from '../../hooks/useSocialSuggested';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

export const SuggestedScreen = () => {
  const { people, isLoading, error, refresh } = useSocialSuggested();

  return (
    <main className="flex flex-col pt-10">
      <ScreenHeader
        title="Discover people"
        backHref={SOCIAL_GRAPH_ROUTES.root}
        actions={
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh suggestions"
            className="text-muted transition-colors hover:text-paper"
          >
            <RefreshCw size={19} />
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : people.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={error ? 'Could not load suggestions' : 'No suggestions right now'}
          body={error ? messageOf(error, 'Could not load suggestions') : "You're already connected to everyone we know about."}
        />
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {people.map(person => (
            <PersonRow
              key={person.id}
              userId={person.id}
              user={person}
              trailing={<FollowButton user={person} size="control" />}
            />
          ))}
        </div>
      )}
    </main>
  );
};
