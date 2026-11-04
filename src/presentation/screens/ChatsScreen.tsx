'use client';

import { MessagesSquare, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { nameOf, type Conversation } from '../../domain/entities/Conversation';
import { messageOf } from '../../domain/errors/AppError';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { Spinner } from '../components/Spinner';
import { formatRelative } from '../format';
import { viewerRelationshipOf } from '../../application/social/relationship';
import { useConversations } from '../hooks/useConversations';
import { useOpenConversation } from '../hooks/useOpenConversation';
import { usePeopleSearch } from '../hooks/usePeopleSearch';
import { conversationRoute } from '../navigation/routes';

interface ConversationRowProps {
  readonly conversation: Conversation;
  readonly active: boolean;
}

const ConversationRow = ({ conversation, active }: ConversationRowProps) => {
  const unread = conversation.unreadCount > 0;
  const name = nameOf(conversation);
  const preview = conversation.lastMessage?.body ?? 'No messages yet';
  const time = formatRelative(conversation.lastMessage?.createdAt ?? null);

  return (
    <li>
      <Link
        href={conversationRoute(conversation.id)}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-cobalt/10 ${
          active ? 'bg-cobalt/15' : ''
        }`}
      >
        <Avatar name={name} url={conversation.peer?.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-base font-semibold text-paper">{name}</span>
            <span className={`shrink-0 text-xs ${unread ? 'text-paper' : 'text-muted'}`}>
              {time}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className={`truncate text-sm ${unread ? 'text-paper' : 'text-muted'}`}>
              {conversation.lastMessage?.mine ? `You: ${preview}` : preview}
            </span>
            {unread ? (
              <span className="flex h-5.5 min-w-5.5 shrink-0 items-center justify-center rounded-full bg-lime px-1.5 text-xs font-bold text-ink">
                {conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
};

/**
 * The list half of chat's master-detail split. Standalone on its own at
 * `<lg` (rendered by ChatsScreen below a ScreenHeader); the persistent
 * master pane at `lg+` (rendered by the `/chats` layout, which supplies its
 * own ScreenHeader once rather than duplicating this one's).
 */
export const ConversationList = () => {
  const params = useParams<{ conversationId?: string }>();
  const openConversationId = params?.conversationId;
  const [query, setQuery] = useState('');
  const { conversations, isLoading, error } = useConversations();
  const needle = query.trim();
  const { people, isSearching } = usePeopleSearch(needle);
  const { open, isOpening } = useOpenConversation();
  const router = useRouter();

  const visible = useMemo(() => {
    const lowered = needle.toLowerCase();
    if (!lowered) return conversations;
    return conversations.filter(conversation =>
      nameOf(conversation).toLowerCase().includes(lowered),
    );
  }, [conversations, needle]);

  // People already in the list are reachable by tapping their thread; this
  // section is only for starting a conversation that does not exist yet.
  const existingPeerIds = useMemo(
    () => new Set(conversations.map(conversation => conversation.peer?.id).filter(Boolean)),
    [conversations],
  );
  const newChatCandidates = needle
    ? people.filter(person => !existingPeerIds.has(person.id) && !viewerRelationshipOf(person)?.isSelf)
    : [];

  const startChat = async (peerId: string): Promise<void> => {
    const conversationId = await open(peerId);
    if (conversationId) router.push(conversationRoute(conversationId));
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="surface mx-4 mb-3 flex h-11 items-center gap-2 rounded-full px-3.5 transition-colors focus-within:border-cobalt">
        <SearchIcon size={17} className="shrink-0 text-faint" />
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          autoComplete="off"
          className="min-w-0 flex-1 text-[15px] text-paper outline-none [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : visible.length === 0 && newChatCandidates.length === 0 && !isSearching ? (
        <EmptyState
          icon={MessagesSquare}
          title={error ? 'Could not load conversations' : 'No conversations yet'}
          body={
            error
              ? messageOf(error, 'Could not load conversations')
              : 'Follow someone back to start a conversation.'
          }
        />
      ) : (
        <div className="flex flex-col overflow-y-auto">
          <ul className="flex flex-col divide-y divide-line">
            {visible.map(conversation => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === openConversationId}
              />
            ))}
          </ul>

          {needle ? (
            <section className="mt-2 flex flex-col">
              <p className="px-4 py-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
                Start a new chat
              </p>
              {isSearching && newChatCandidates.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : newChatCandidates.length === 0 ? (
                <p className="px-4 pb-4 text-[13px] text-muted">
                  No other people matched &ldquo;{needle}&rdquo;.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {newChatCandidates.map(person => {
                    const relationship = viewerRelationshipOf(person);
                    const canMessage = Boolean(relationship?.canMessage);
                    return (
                      <li key={person.id}>
                        <button
                          type="button"
                          disabled={!canMessage || isOpening}
                          onClick={() => void startChat(person.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cobalt/10 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-transparent"
                        >
                          <Avatar name={person.displayName || person.handle} url={person.avatarUrl} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-paper">
                              {person.displayName || person.handle}
                            </span>
                            <span className="block truncate text-[12px] text-muted">
                              {canMessage ? `@${person.handle}` : 'You both need to follow each other to chat'}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
};

/**
 * `/chats`. Below `lg` this is the whole screen (header + list). At `lg+`
 * the `/chats` layout already shows the list as a persistent master pane,
 * so this becomes the empty detail-pane prompt instead of a second copy of
 * the same list — see `app/(app)/chats/layout.tsx`.
 *
 * No pagination here: useConversations (owned by another phase) returns a
 * single flat page with no cursor/hasMore for useInfiniteScroll to call.
 * Wiring real pagination needs that hook converted to useInfiniteQuery —
 * reported, not patched around here.
 */
export const ChatsScreen = () => (
  // h-full, not min-h-dvh: the chats shell is a fixed-height overflow-hidden
  // row, so a main that can grow past it clips the end of a long list with no
  // way to scroll to it. The list pane owns the scrolling instead.
  <main id="main-content" tabIndex={-1} className="flex h-full min-h-0 flex-col">
    <div className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto lg:hidden">
      <ScreenHeader title="Chats" />
      <ConversationList />
    </div>
    <div className="hidden min-h-0 flex-1 items-center justify-center lg:flex">
      <EmptyState
        icon={MessagesSquare}
        title="Select a conversation"
        body="Choose someone from the list to see your messages."
      />
    </div>
  </main>
);
