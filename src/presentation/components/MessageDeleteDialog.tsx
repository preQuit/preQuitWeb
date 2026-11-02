'use client';

import { useEffect } from 'react';

import type { Message } from '../../domain/entities/Message';

export interface MessageDeleteDialogProps {
  readonly message: Message | null;
  onDelete(forEveryone: boolean): void;
  onCancel(): void;
}

/**
 * Deleting your own message is a three-way choice, which a two-button confirm
 * cannot express without turning "Cancel" into a destructive action. A
 * received message offers only the one-sided option.
 */
export const MessageDeleteDialog = ({ message, onDelete, onCancel }: MessageDeleteDialogProps) => {
  useEffect(() => {
    if (!message) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [message, onCancel]);

  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Delete message"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="surface-raised animate-rise relative z-10 w-full max-w-sm overflow-hidden rounded-card">
        <div className="px-5 pt-4 pb-3">
          <h2 className="text-[17px] font-bold text-paper">Delete message?</h2>
          <p className="mt-1 line-clamp-2 text-[13px] text-muted">{message.body}</p>
        </div>

        <div className="flex flex-col gap-2 px-5 pb-5">
          {message.mine ? (
            <button
              type="button"
              onClick={() => onDelete(true)}
              className="w-full rounded-xl bg-danger py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-danger/85"
            >
              Delete for everyone
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(false)}
            className="surface w-full rounded-xl py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-cobalt/15"
          >
            Delete for me
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl py-2.5 text-[14px] font-semibold text-muted transition-colors hover:text-paper"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
