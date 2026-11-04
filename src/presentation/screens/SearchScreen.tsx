'use client';

import { ChevronRight, Search as SearchIcon, SearchX, Tag, UserRoundSearch, X } from 'lucide-react';

import Link from 'next/link';

import type { Topic } from '../../domain/entities/Topic';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Spinner } from '../components/Spinner';
import { useSearch } from '../hooks/useSearch';
import { ROUTES } from '../navigation/routes';

interface TopicTagProps {
  readonly topic: Topic;
}

const TopicTag = ({ topic }: TopicTagProps) => (
  <span className="surface flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-paper">
    <Tag size={13} />
    {topic.label}
  </span>
);

export const SearchScreen = () => {
  const { query, setQuery, clear, isActive, isSearching, results, trendingTopics } = useSearch();

  const topics = isActive ? results.topics : trendingTopics;
  const posts = results.posts;
  const nothingFound = isActive && !isSearching && topics.length === 0 && posts.length === 0;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col"
    >
      <ScreenHeader title="Search" />

      <div className="surface flex h-14 items-center gap-2.5 rounded-2xl px-4 transition-colors focus-within:border-cobalt">
        <SearchIcon size={20} className="shrink-0 text-faint" />
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search PreQuit"
          aria-label="Search PreQuit"
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

      {/* The side rail carries this link on desktop, but GlassTabBar renders
          PRIMARY_NAV only — without this row /people is unreachable on mobile. */}
      <Link
        href={ROUTES.PEOPLE}
        className="surface mt-3 flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors hover:bg-cobalt/12 md:hidden"
      >
        <span className="surface-subtle flex size-9 shrink-0 items-center justify-center rounded-full">
          <UserRoundSearch size={17} className="text-paper" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-paper">Find friends</span>
          <span className="block truncate text-[12px] text-muted">
            Search people by name or @handle
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-faint" />
      </Link>

      <section className="mt-6 flex flex-col gap-3">
        <SectionLabel>{isActive ? 'Topics' : 'Trending topics'}</SectionLabel>
        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {topics.map(topic => (
              <TopicTag key={topic.id || topic.slug} topic={topic} />
            ))}
          </div>
        ) : null}
      </section>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : null}

      {posts.length > 0 ? (
        <section className="mt-7 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">
          <SectionLabel className="lg:col-span-2">Posts</SectionLabel>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : null}

      {nothingFound ? (
        <EmptyState icon={SearchX} title={`No results match “${query.trim()}”`} />
      ) : null}
    </main>
  );
};
