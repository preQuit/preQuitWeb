'use client';

import { AlertCircle, ChevronDown, ChevronLeft, CornerUpLeft, MessageCircle, MoreHorizontal, Search, Send, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { nameOf } from '../../domain/entities/Conversation';
import { messageOf } from '../../domain/errors/AppError';
import { MessageDelivery, type Message } from '../../domain/entities/Message';
import { Avatar } from '../components/Avatar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { MessageDeleteDialog } from '../components/MessageDeleteDialog';
import { MessageInfoDialog } from '../components/MessageInfoDialog';
import { Spinner } from '../components/Spinner';
import { TypingIndicator } from '../components/TypingIndicator';
import { formatClock } from '../format';
import { useConversation } from '../hooks/useConversation';
import { useConversationActions } from '../hooks/useConversationActions';
import { useConversations } from '../hooks/useConversations';
import { ROUTES } from '../navigation/routes';

const statusOf = (message: Message): string => {
  if (message.delivery === MessageDelivery.FAILED) return 'Not delivered';
  if (message.delivery === MessageDelivery.PENDING) return 'Sending…';
  // Only the sender cares whether their own message landed; showing "Seen" on
  // the other person's message would be nonsense. The timestamp shown is the
  // receipt's own, not the message's — "Seen 09:04" has to mean when it was
  // seen, not when it was sent.
  if (message.mine && message.delivery === MessageDelivery.READ) {
    return `Seen · ${formatClock(message.seenAt ?? message.createdAt)}`;
  }
  if (message.mine && message.delivery === MessageDelivery.DELIVERED) {
    return `Delivered · ${formatClock(message.deliveredAt ?? message.createdAt)}`;
  }
  return formatClock(message.createdAt);
};

interface BubbleProps {
  readonly message: Message;
  readonly repliedTo: Message | null;
  onReply(message: Message): void;
  onInfo(message: Message): void;
  onDelete(message: Message): void;
}

const Bubble = ({ message, repliedTo, onReply, onInfo, onDelete }: BubbleProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pending = message.delivery === MessageDelivery.PENDING;

  const act = (run: (message: Message) => void) => (): void => {
    setMenuOpen(false);
    run(message);
  };

  return (
    <li
      className={`group relative flex max-w-[min(78%,620px)] flex-col px-3.5 py-2.5 ${
        message.mine
          ? 'self-end rounded-[18px] rounded-br-sm bg-cobalt text-paper'
          : 'surface self-start rounded-[18px] rounded-bl-sm text-paper'
      }`}
    >
      {/* The menu trigger sits in the bubble's own top corner so it belongs to
          this message rather than to the thread. */}
      <button
        type="button"
        onClick={() => setMenuOpen(open => !open)}
        aria-label="Message options"
        aria-expanded={menuOpen}
        disabled={pending}
        className={`absolute top-1 right-1 rounded-full p-0.5 transition-opacity disabled:opacity-0 ${
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-70 focus-visible:opacity-100'
        } ${message.mine ? 'text-paper' : 'text-muted'}`}
      >
        <ChevronDown size={15} />
      </button>

      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div
            className={`surface-raised absolute top-6 z-20 w-40 overflow-hidden rounded-xl ${
              message.mine ? 'right-1' : 'left-1'
            }`}
          >
            <button
              type="button"
              onClick={act(onReply)}
              className="block w-full px-3.5 py-2.5 text-left text-[13px] text-paper hover:bg-surface-fill"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={act(onInfo)}
              className="block w-full px-3.5 py-2.5 text-left text-[13px] text-paper hover:bg-surface-fill"
            >
              Info
            </button>
            <button
              type="button"
              onClick={act(onDelete)}
              className="block w-full border-t border-line px-3.5 py-2.5 text-left text-[13px] text-danger hover:bg-danger/10"
            >
              Delete
            </button>
          </div>
        </>
      ) : null}

      {repliedTo ? (
        <span
          className={`mb-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] ${
            message.mine ? 'bg-ink/25 text-paper/75' : 'surface-subtle text-muted'
          }`}
        >
          <CornerUpLeft size={11} className="shrink-0" />
          <span className="truncate">{repliedTo.body || 'Message'}</span>
        </span>
      ) : null}

      <span className="pr-4 text-[15px] leading-5 whitespace-pre-wrap">{message.body}</span>
      <span className={`mt-1 self-end text-[10px] ${message.mine ? 'text-paper/60' : 'text-muted'}`}>
        {statusOf(message)}
      </span>
    </li>
  );
};

export const DirectMessageScreen = () => {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId ?? null;
  const { conversations } = useConversations();
  const { messages, isLoading, isSending, error, send, typingUserIds, notifyTyping, deleteMessage } =
    useConversation(conversationId);
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [needle, setNeedle] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [infoFor, setInfoFor] = useState<Message | null>(null);
  const [deleteFor, setDeleteFor] = useState<Message | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(item => item.id === conversationId) ?? null;
  const name = conversation ? nameOf(conversation) : 'Chat';
  const handle = conversation?.peer?.handle;
  const peerId = conversation?.peer?.id ?? null;
  const { isWorking, clearChat, deleteChat, blockPeer } = useConversationActions(conversationId, peerId);

  const trimmedNeedle = needle.trim().toLowerCase();
  const shownMessages = trimmedNeedle
    ? messages.filter(message => (message.body ?? '').toLowerCase().includes(trimmedNeedle))
    : messages;

  // Reply previews resolve against what is loaded; an older parent that has
  // scrolled out of the page simply renders without its quote.
  const byId = new Map(messages.map(message => [message.id, message]));
  const peerTyping = typingUserIds.length > 0 && !trimmedNeedle;

  const runAction = (title: string, action: () => void): void => {
    setMenuOpen(false);
    setConfirmTitle(title);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!trimmedNeedle) bottom.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, trimmedNeedle]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || isSending) return;
    const inReplyTo = replyTo?.id ?? null;
    setDraft('');
    setReplyTo(null);
    await send(body, inReplyTo);
  };

  const showEmpty = !isLoading && !error && shownMessages.length === 0;

  return (
    <main id="main-content" tabIndex={-1} className="flex h-dvh min-h-0 flex-col overflow-hidden">
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-label="Conversation options"
            aria-expanded={menuOpen}
            disabled={isWorking}
            className="text-muted transition-colors hover:text-paper disabled:opacity-50"
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="surface-raised absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="block w-full px-3.5 py-2.5 text-left text-[13px] text-paper hover:bg-surface-fill"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runAction('Clear this chat? Messages are removed from your side only.', clearChat)
                  }
                  className="block w-full px-3.5 py-2.5 text-left text-[13px] text-paper hover:bg-surface-fill"
                >
                  Clear chat
                </button>
                <button
                  type="button"
                  onClick={() => runAction('Delete this chat from your list?', deleteChat)}
                  className="block w-full px-3.5 py-2.5 text-left text-[13px] text-paper hover:bg-surface-fill"
                >
                  Delete chat
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      `Block ${handle ? `@${handle}` : name}? They will not be able to message you.`,
                      blockPeer,
                    )
                  }
                  disabled={!peerId}
                  className="block w-full border-t border-line px-3.5 py-2.5 text-left text-[13px] text-danger hover:bg-danger/10 disabled:opacity-40"
                >
                  Block
                </button>
              </div>
            </>
          ) : null}
        </div>
      </header>

      {searchOpen ? (
        <div className="flex items-center gap-2.5 border-b border-line bg-ink px-3 py-2">
          <Search size={16} className="shrink-0 text-faint" />
          <input
            autoFocus
            type="search"
            value={needle}
            onChange={event => setNeedle(event.target.value)}
            placeholder="Search in conversation"
            aria-label="Search in conversation"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-paper outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <span className="shrink-0 text-[11px] text-muted">
            {trimmedNeedle ? `${shownMessages.length} found` : ''}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setNeedle('');
            }}
            aria-label="Close search"
            className="shrink-0 text-faint transition-colors hover:text-paper"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="flex w-full min-h-0 flex-1 flex-col justify-end overflow-y-auto px-4 py-4">
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
          trimmedNeedle ? (
            <EmptyState
              icon={Search}
              title="No matches"
              body={`No message in this chat contains "${needle.trim()}".`}
            />
          ) : (
            <EmptyState icon={MessageCircle} title="Say hello" body="No messages yet — break the ice." />
          )
        ) : (
          <ul className="flex flex-col gap-2">
            {shownMessages.map(message => (
              <Bubble
                key={message.id}
                message={message}
                repliedTo={message.replyToId ? (byId.get(message.replyToId) ?? null) : null}
                onReply={setReplyTo}
                onInfo={setInfoFor}
                onDelete={setDeleteFor}
              />
            ))}
            {peerTyping ? <TypingIndicator name={name} /> : null}
          </ul>
        )}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={submit}
        className="sticky bottom-0 border-t border-line bg-ink px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {replyTo ? (
          <div className="mb-2 flex w-full items-center gap-2 rounded-xl border-l-2 border-cobalt bg-surface-fill px-3 py-2">
            <CornerUpLeft size={14} className="shrink-0 text-cobalt" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-cobalt">
                Replying to {replyTo.mine ? 'yourself' : name}
              </span>
              <span className="block truncate text-[12px] text-muted">{replyTo.body}</span>
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              className="shrink-0 text-faint transition-colors hover:text-paper"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        <div className="flex w-full items-end gap-2">
          <input
            value={draft}
            onChange={event => {
              setDraft(event.target.value);
              // The gateway expires a typing flag on its own after ~6s, so this
              // only needs to fire on input, never on a timer.
              if (event.target.value.length > 0) notifyTyping();
            }}
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

      <MessageInfoDialog message={infoFor} onClose={() => setInfoFor(null)} />

      <MessageDeleteDialog
        message={deleteFor}
        onDelete={forEveryone => {
          const target = deleteFor;
          setDeleteFor(null);
          if (target) void deleteMessage(target.id, forEveryone);
        }}
        onCancel={() => setDeleteFor(null)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          confirmAction?.();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
};
