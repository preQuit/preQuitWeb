'use client';

import { useEffect } from 'react';

import type { Message } from '../../domain/entities/Message';
import { formatFullTimestamp } from '../format';

export interface MessageInfoDialogProps {
  readonly message: Message | null;
  onClose(): void;
}

interface RowProps {
  readonly label: string;
  readonly at: string | null;
  readonly pendingLabel: string;
}

const Row = ({ label, at, pendingLabel }: RowProps) => (
  <div className="flex items-baseline justify-between gap-4 py-2">
    <span className="text-[13px] font-semibold text-paper">{label}</span>
    <span className={`text-[13px] ${at ? 'text-muted' : 'text-faint'}`}>
      {at ? formatFullTimestamp(at) : pendingLabel}
    </span>
  </div>
);

export const MessageInfoDialog = ({ message, onClose }: MessageInfoDialogProps) => {
  useEffect(() => {
    if (!message) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Message info"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="surface-raised animate-rise relative z-10 w-full max-w-sm overflow-hidden rounded-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[17px] font-bold text-paper">Message info</h2>
          <p className="mt-1 line-clamp-2 text-[13px] text-muted">{message.body}</p>
        </div>
        <div className="divide-y divide-line px-5 py-2">
          <Row label="Sent" at={message.createdAt} pendingLabel="—" />
          {/* Only the sender's own messages carry peer receipts; on a received
              message these are the viewer's own and tell them nothing. */}
          {message.mine ? (
            <>
              <Row label="Delivered" at={message.deliveredAt} pendingLabel="Not yet delivered" />
              <Row label="Seen" at={message.seenAt} pendingLabel="Not seen yet" />
            </>
          ) : null}
        </div>
        <div className="px-5 pt-2 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="surface w-full rounded-xl py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-cobalt/15"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
