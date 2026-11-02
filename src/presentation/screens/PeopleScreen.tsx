'use client';

import { Search as SearchIcon, UserRoundSearch, X } from 'lucide-react';

import { EmptyState } from '../components/EmptyState';
import { FollowButton } from '../components/FollowButton';
import { PersonRow } from '../components/PersonRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Spinner } from '../components/Spinner';
import { usePeopleDirectory } from '../hooks/usePeopleSearch';

export const PeopleScreen = () => {
  const { query, setQuery, clear, isActive, isSearching, people, suggested } = usePeopleDirectory();

  const shown = isActive ? people : suggested;
  const nothingFound = isActive && !isSearching && people.length === 0;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col"
    >
      <ScreenHeader title="People" />

      <div className="surface flex h-14 items-center gap-2.5 rounded-2xl px-4 transition-colors focus-within:border-cobalt">
        <SearchIcon size={20} className="shrink-0 text-faint" />
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search people by name or @handle"
          aria-label="Search people"
          autoComplete="off"
          className="min-w-0 flex-1 text-base text-paper outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {isActive ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="shrink-0 text-faint transition-colors hover:text-paper"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : null}

      {nothingFound ? (
        <EmptyState
          icon={UserRoundSearch}
          title="No people found"
          body={`Nothing matched "${query.trim()}". Try a different name or handle.`}
        />
      ) : null}

      {shown.length > 0 ? (
        <section className="mt-6 flex flex-col gap-3">
          <SectionLabel>{isActive ? 'People' : 'Suggested for you'}</SectionLabel>
          <div className="surface divide-y divide-line overflow-hidden rounded-card">
            {shown.map(person => (
              <PersonRow
                key={person.id}
                userId={person.id}
                user={person}
                trailing={<FollowButton user={person} size="control" />}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};
