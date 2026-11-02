'use client';

import { AlertCircle, ChevronLeft, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { nameOf } from '../../domain/entities/Conversation';
import { messageOf } from '../../domain/errors/AppError';
import { MessageDelivery, type Message } from '../../domain/entities/Message';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { formatClock } from '../format';
import { useConversation } from '../hooks/useConversation';
import { useConversations } from '../hooks/useConversations';
import { ROUTES } from '../navigation/routes';

const statusOf = (message: Message): string => {
  if (message.delivery === MessageDelivery.FAILED) return 'Not delivered';
  if (message.delivery === MessageDelivery.PENDING) return 'Sending…';
  // Only the sender cares whether their own message landed; showing "Read" on
  // the other person's message would be nonsense.
  if (message.mine && message.delivery === MessageDelivery.READ) return `Read · ${formatClock(message.createdAt)}`;
  if (message.mine && message.delivery === MessageDelivery.DELIVERED) {
    return `Delivered · ${formatClock(message.createdAt)}`;
  }
  return formatClock(message.createdAt);
};

interface BubbleProps {
  readonly message: Message;
}

const Bubble = ({ message }: BubbleProps) => (
  <li
    className={`flex max-w-[78%] flex-col px-3.5 py-2.5 ${
      message.mine
        ? 'self-end rounded-[18px] rounded-br-sm bg-cobalt text-paper'
        : 'surface self-start rounded-[18px] rounded-bl-sm text-paper'
    }`}
  >
    <span className="text-[15px] leading-5 whitespace-pre-wrap">{message.body}</span>
    <span
      className={`mt-1 self-end text-[10px] ${message.mine ? 'text-paper/60' : 'text-muted'}`}
    >
      {statusOf(message)}
    </span>
  </li>
);

export const DirectMessageScreen = () => {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId ?? null;
  const { conversations } = useConversations();
  const { messages, isLoading, isSending, error, send } = useConversation(conversationId);
  const [draft, setDraft] = useState('');
  const bottom = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(item => item.id === conversationId) ?? null;
  const name = conversation ? nameOf(conversation) : 'Chat';
  const handle = conversation?.peer?.handle;

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || isSending) return;
    setDraft('');
    await send(body);
  };

  const showEmpty = !isLoading && !error && messages.length === 0;

  return (
    <main id="main-content" tabIndex={-1} className="flex h-full min-h-0 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-ink px-3 py-3">
        <Link
          href={ROUTES.CHATS}
          aria-label="Back to chats"
          className="text-paper transition-opacity hover:opacity-70 lg:hidden"
        >
          <ChevronLeft size={26} />
        </Link>
        <Avatar name={name} url={conversation?.peer?.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-paper">{name}</p>
          <p className="truncate text-xs text-muted">
            {handle ? `@${handle}` : 'Direct message'}
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-end overflow-y-auto px-3 py-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load this conversation"
            body={messageOf(error, 'Could not load this conversation')}
          />
        ) : showEmpty ? (
          <EmptyState icon={MessageCircle} title="Say hello" body="No messages yet — break the ice." />
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map(message => (
              <Bubble key={message.id} message={message} />
            ))}
          </ul>
        )}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={submit}
        className="tabbar-clear sticky bottom-0 border-t border-line bg-ink px-3 pt-3 md:pb-3"
      >
        <div className="mx-auto flex w-full max-w-[640px] items-end gap-2">
          <input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Message"
            aria-label="Message"
            autoComplete="off"
            className="field h-11 min-w-0 flex-1 rounded-full px-4 text-[15px] text-paper outline-none focus:field-focus"
          />
          <button
            type="submit"
            disabled={isSending || draft.trim().length === 0}
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition-opacity disabled:opacity-40"
          >
            {isSending ? <Spinner size="sm" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </main>
  );
};
