'use client';

import { MessagesSquare, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
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
}

const ConversationRow = ({ conversation }: ConversationRowProps) => {
  const unread = conversation.unreadCount > 0;
  const name = nameOf(conversation);
  const preview = conversation.lastMessage?.body ?? 'No messages yet';
  const time = formatRelative(conversation.lastMessage?.createdAt ?? null);

  return (
    <li>
      <Link
        href={conversationRoute(conversation.id)}
        className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-white/5"
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
              <span className="flex h-5.5 min-w-5.5 shrink-0 items-center justify-center rounded-full bg-paper px-1.5 text-xs font-bold text-ink">
                {conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
};

export const ChatsScreen = () => {
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
    <main className="flex flex-col">
      <ScreenHeader title="Chats" />

      <div className="glass mx-4 mb-3 flex h-11 items-center gap-2 rounded-full px-3.5 transition-colors focus-within:border-glass-edge">
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
        <ul className="flex flex-col divide-y divide-white/8">
          {visible.map(conversation => (
            <ConversationRow key={conversation.id} conversation={conversation} />
          ))}
        </ul>
      )}
    </main>
  );
};
