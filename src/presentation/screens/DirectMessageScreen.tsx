'use client';

import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { nameOf } from '../../domain/entities/Conversation';
import { MessageDelivery, type Message } from '../../domain/entities/Message';
import { Avatar } from '../components/Avatar';
import { Spinner } from '../components/Spinner';
import { formatClock } from '../format';
import { useConversation } from '../hooks/useConversation';
import { useConversations } from '../hooks/useConversations';
import { ROUTES } from '../navigation/routes';

const statusOf = (message: Message): string => {
  if (message.delivery === MessageDelivery.FAILED) return 'Not delivered';
  if (message.delivery === MessageDelivery.PENDING) return 'Sending…';
  return formatClock(message.createdAt);
};

interface BubbleProps {
  readonly message: Message;
}

const Bubble = ({ message }: BubbleProps) => (
  <li
    className={`flex max-w-[78%] flex-col px-3.5 py-2.5 ${
      message.mine
        ? 'self-end rounded-[18px] rounded-br-sm bg-paper text-ink'
        : 'glass self-start rounded-[18px] rounded-bl-sm text-paper'
    }`}
  >
    <span className="text-[15px] leading-5 whitespace-pre-wrap">{message.body}</span>
    <span
      className={`mt-1 self-end text-[10px] ${message.mine ? 'text-black/45' : 'text-muted'}`}
    >
      {statusOf(message)}
    </span>
  </li>
);

export const DirectMessageScreen = () => {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId ?? null;
  const { conversations } = useConversations();
  const { messages, isLoading, isSending, send } = useConversation(conversationId);
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

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-ink/70 px-3 py-3 backdrop-blur-2xl">
        <Link
          href={ROUTES.CHATS}
          aria-label="Back to chats"
          className="text-paper transition-opacity hover:opacity-70"
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

      <div className="flex flex-1 flex-col justify-end px-3 py-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
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
        className="sticky bottom-0 flex items-end gap-2 border-t border-white/10 bg-ink/70 px-3 py-3 pb-24 backdrop-blur-2xl"
      >
        <input
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Message"
          aria-label="Message"
          autoComplete="off"
          className="glass-field h-11 min-w-0 flex-1 rounded-full px-4 text-[15px] text-paper outline-none"
        />
        <button
          type="submit"
          disabled={isSending || draft.trim().length === 0}
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition-opacity disabled:opacity-40"
        >
          {isSending ? <Spinner size="sm" /> : <Send size={18} />}
        </button>
      </form>
    </main>
  );
};
