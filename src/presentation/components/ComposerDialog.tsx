'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { messageOf } from '../../domain/errors/AppError';
import { useUseCases } from '../container/DependencyProvider';
import { FormError } from './FormError';
import { GlassButton } from './GlassButton';

const MAX_IMAGES = 10;

export interface ComposerDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

interface Picked {
  readonly file: File;
  readonly preview: string;
}

export const ComposerDialog = ({ open, onClose }: ComposerDialogProps) => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const fieldId = useId();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState('');
  const [picked, setPicked] = useState<readonly Picked[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  // Object URLs are a manual allocation; drop them when the dialog closes or
  // the selection changes, or the page leaks one per image picked.
  useEffect(
    () => () => {
      picked.forEach(item => URL.revokeObjectURL(item.preview));
    },
    [picked],
  );

  const reset = () => {
    setDescription('');
    setPicked([]);
    setFailure(null);
  };

  const publish = useMutation({
    mutationFn: () => useCases.createPost.execute({ description, files: picked.map(p => p.file) }),
    onSuccess: async () => {
      reset();
      onClose();
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: error => setFailure(messageOf(error, 'Could not publish your post.')),
  });

  if (!open) return null;

  const choose = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .slice(0, MAX_IMAGES - picked.length)
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPicked(current => [...current, ...next]);
    setFailure(null);
  };

  const remove = (preview: string) => {
    URL.revokeObjectURL(preview);
    setPicked(current => current.filter(item => item.preview !== preview));
  };

  const canPublish = picked.length > 0 && !publish.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a post"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onClick={event => {
        if (event.target === event.currentTarget && !publish.isPending) onClose();
      }}
    >
      <section className="glass-raised aero-sheen animate-panel-expand w-full max-w-xl rounded-glass">
        <header className="aero-rule flex items-center justify-between px-6 py-3.5">
          <h2 className="font-display text-base font-semibold text-paper aero-text-shadow">
            Create a post
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={publish.isPending}
            className="flex size-7 items-center justify-center rounded-control text-muted transition-colors hover:bg-white/8 hover:text-paper disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-col gap-4 px-6 py-5">
          <label htmlFor={fieldId} className="flex flex-col gap-1.5">
            <span className="text-control font-semibold text-paper/90 aero-text-shadow">
              Description:
            </span>
            <textarea
              id={fieldId}
              rows={3}
              maxLength={2200}
              value={description}
              placeholder="Say something about it…"
              onChange={event => setDescription(event.target.value)}
              className="glass-field w-full resize-none px-3.5 py-2.5 text-action text-paper outline-none focus-within:glass-field-focus"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-control font-semibold text-paper/90 aero-text-shadow">
              Images: <span className="font-normal text-muted">required, up to {MAX_IMAGES}</span>
            </span>

            {picked.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {picked.map(item => (
                  <div key={item.preview} className="relative">
                    {/* a local object URL, so next/image would add nothing here */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.preview}
                      alt=""
                      className="size-20 rounded-control border border-glass-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.preview)}
                      aria-label="Remove image"
                      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-black/60 bg-black/80 text-paper hover:bg-danger"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={event => {
                choose(event.target.files);
                event.target.value = '';
              }}
            />
            <GlassButton
              tone="secondary"
              size="control"
              onClick={() => fileInput.current?.click()}
              disabled={picked.length >= MAX_IMAGES}
              className="w-fit"
            >
              <ImagePlus size={15} />
              Add images
            </GlassButton>
          </div>

          <FormError message={failure} />

          <div className="flex items-center justify-end gap-2 pt-1">
            <GlassButton tone="quiet" onClick={onClose} disabled={publish.isPending}>
              Cancel
            </GlassButton>
            <GlassButton
              tone="primary"
              onClick={() => publish.mutate()}
              disabled={!canPublish}
              className="min-w-24"
            >
              {publish.isPending ? 'Publishing…' : 'Publish'}
            </GlassButton>
          </div>
        </div>
      </section>
    </div>
  );
};
