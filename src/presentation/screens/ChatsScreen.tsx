'use client';

import { MessagesSquare, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { nameOf, type Conversation } from '../../domain/entities/Conversation';
import { messageOf } from '../../domain/errors/AppError';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { Spinner } from '../components/Spinner';
import { formatRelative } from '../format';
import { useConversations } from '../hooks/useConversations';
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

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter(conversation =>
      nameOf(conversation).toLowerCase().includes(needle),
    );
  }, [conversations, query]);

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
      ) : visible.length === 0 ? (
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
        <ul className="flex flex-col divide-y divide-line overflow-y-auto">
          {visible.map(conversation => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === openConversationId}
            />
          ))}
        </ul>
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
  <main id="main-content" tabIndex={-1} className="flex min-h-dvh flex-col">
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col lg:hidden">
      <ScreenHeader title="Chats" />
      <ConversationList />
    </div>
    <div className="hidden flex-1 items-center justify-center lg:flex">
      <EmptyState
        icon={MessagesSquare}
        title="Select a conversation"
        body="Choose someone from the list to see your messages."
      />
    </div>
  </main>
);
