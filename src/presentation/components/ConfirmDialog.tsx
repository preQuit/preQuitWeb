'use client';

import { useEffect, useRef } from 'react';

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly body?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
  readonly destructive?: boolean;
  readonly busy?: boolean;
  onConfirm(): void;
  onCancel(): void;
}

/**
 * In-app replacement for window.confirm, so a destructive step is styled like
 * the rest of the product instead of a browser chrome dialog. Escape and the
 * backdrop both cancel; focus moves to the cancel button so a stray Enter
 * does not confirm.
 */
export const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  imageSrc,
  imageAlt = '',
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />

      <div className="surface-raised animate-rise relative z-10 w-full max-w-sm overflow-hidden rounded-card">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-44 w-full bg-black object-contain"
          />
        ) : null}

        <div className="flex flex-col gap-2 px-5 pt-4 pb-5">
          <h2 className="text-[17px] font-bold text-paper">{title}</h2>
          {body ? <p className="text-[13px] leading-5 text-muted">{body}</p> : null}

          <div className="mt-4 flex gap-2.5">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="surface flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-cobalt/15 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`flex-1 rounded-xl py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50 ${
                destructive
                  ? 'bg-danger text-white hover:bg-danger/85'
                  : 'bg-cobalt text-paper hover:bg-cobalt/85'
              }`}
            >
              {busy ? 'Deleting…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
