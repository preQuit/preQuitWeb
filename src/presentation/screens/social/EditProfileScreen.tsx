'use client';

import { Camera, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import type { ProfileLink } from '../../../domain/entities/User';
import { messageOf } from '../../../domain/errors/AppError';
import { Avatar } from '../../components/Avatar';
import { FormError } from '../../components/FormError';
import { FormNotice } from '../../components/FormNotice';
import { GlassButton } from '../../components/GlassButton';
import { GlassField } from '../../components/GlassField';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { Spinner } from '../../components/Spinner';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { useSocialProfileEditor } from '../../hooks/useSocialProfileEditor';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

const kb = (bytes: number): string =>
  bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

interface Draft {
  readonly displayName: string;
  readonly bio: string;
  readonly isPrivate: boolean;
  readonly links: readonly ProfileLink[];
}

const MAX_LINKS = 5;
const BIO_MAX = 300;

export const EditProfileScreen = () => {
  const router = useRouter();
  const { profile, isLoading, isSaving, error, save } = useSocialProfileEditor();
  const avatar = useAvatarUpload();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const seeded = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const pickAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Clear the input straight away, or re-picking the same file is a no-op.
    event.target.value = '';
    if (!file) return;
    setNotice(null);
    try {
      await avatar.upload(file);
      setNotice('Profile picture updated.');
    } catch {
      // surfaced below via `avatar.error`
    }
  };

  useEffect(() => {
    if (profile && !seeded.current) {
      seeded.current = true;
      setDraft({
        displayName: profile.displayName,
        bio: profile.bio,
        isPrivate: profile.isPrivate,
        links: profile.links,
      });
    }
  }, [profile]);

  const updateLink = (index: number, patch: Partial<ProfileLink>) => {
    setDraft(current =>
      current
        ? { ...current, links: current.links.map((link, i) => (i === index ? { ...link, ...patch } : link)) }
        : current,
    );
  };

  const removeLink = (index: number) => {
    setDraft(current => (current ? { ...current, links: current.links.filter((_, i) => i !== index) } : current));
  };

  const addLink = () => {
    setDraft(current =>
      current && current.links.length < MAX_LINKS
        ? { ...current, links: [...current.links, { label: '', url: '' }] }
        : current,
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft || isSaving) return;
    setNotice(null);

    try {
      await save({
        displayName: draft.displayName.trim(),
        bio: draft.bio.trim(),
        isPrivate: draft.isPrivate,
        links: draft.links.filter(link => link.label.trim() && link.url.trim()),
      });
      setNotice('Profile updated.');
    } catch {
      // surfaced below via `error`
    }
  };

  if (isLoading || !draft) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="flex flex-col pt-10 pb-10">
      <ScreenHeader title="Edit profile" backHref={SOCIAL_GRAPH_ROUTES.root} />

      <form onSubmit={submit} className="flex flex-col gap-5 px-6">
        <section className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={profile?.displayName || profile?.handle || '?'} url={profile?.avatarUrl} size="xl" />
            {avatar.isUploading ? (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/70">
                <Spinner />
              </span>
            ) : null}
          </div>

          {/* The visible control is the button; the input stays out of the
              layout so it cannot be focused or styled into the form flow. */}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={pickAvatar}
          />
          <GlassButton
            type="button"
            tone="outline"
            size="control"
            disabled={avatar.isUploading}
            onClick={() => fileInput.current?.click()}
          >
            <Camera size={15} />
            {profile?.avatarUrl ? 'Change photo' : 'Add photo'}
          </GlassButton>

          <p className="text-center text-[12px] text-muted">
            {avatar.result
              ? `Resized and uploaded — ${kb(avatar.result.originalBytes)} down to ${kb(avatar.result.uploadedBytes)}.`
              : 'Any size works. Pictures are cropped square and shrunk before upload.'}
          </p>
          <FormError message={avatar.error ? messageOf(avatar.error, 'Could not update your picture.') : null} />
        </section>

        <GlassField
          label="Display name"
          value={draft.displayName}
          maxLength={50}
          onChange={event => setDraft(current => current && { ...current, displayName: event.target.value })}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-control font-bold tracking-wide text-muted uppercase">Bio</span>
          <textarea
            className="field min-h-28 resize-none px-4 py-3 text-action text-paper outline-none focus:field-focus"
            value={draft.bio}
            maxLength={BIO_MAX}
            onChange={event => setDraft(current => current && { ...current, bio: event.target.value })}
          />
          <span className="self-end text-[11px] text-faint">{draft.bio.length}/{BIO_MAX}</span>
        </label>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-paper">Private account</span>
            <span className="text-[12px] text-muted">New followers need your approval.</span>
          </div>
          <GlassButton
            type="button"
            tone={draft.isPrivate ? 'secondary' : 'outline'}
            size="control"
            onClick={() => setDraft(current => current && { ...current, isPrivate: !current.isPrivate })}
          >
            {draft.isPrivate ? 'Private' : 'Public'}
          </GlassButton>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionLabel>Links</SectionLabel>
            {draft.links.length < MAX_LINKS ? (
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 text-[12px] font-semibold text-cobalt-bright hover:underline"
              >
                <Plus size={14} /> Add link
              </button>
            ) : null}
          </div>

          {draft.links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <GlassField
                placeholder="Label"
                value={link.label}
                maxLength={30}
                className="flex-1"
                onChange={event => updateLink(index, { label: event.target.value })}
              />
              <GlassField
                placeholder="https://"
                value={link.url}
                className="flex-[2]"
                onChange={event => updateLink(index, { url: event.target.value })}
              />
              <button
                type="button"
                aria-label="Remove link"
                onClick={() => removeLink(index)}
                className="text-muted transition-colors hover:text-failure"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <FormError message={error ? messageOf(error, 'Could not update your profile.') : null} />
        <FormNotice message={notice} />

        <GlassButton type="submit" tone="primary" disabled={isSaving} className="mt-1">
          {isSaving ? 'Saving…' : 'Save changes'}
        </GlassButton>
        <GlassButton type="button" tone="quiet" onClick={() => router.back()}>
          Cancel
        </GlassButton>
      </form>
    </main>
  );
};
