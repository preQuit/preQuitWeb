'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { messageOf } from '../../domain/errors/AppError';
import { AuthPanel } from '../components/AuthPanel';
import { FormError } from '../components/FormError';
import { FormNotice } from '../components/FormNotice';
import { GlassButton } from '../components/GlassButton';
import { GlassField } from '../components/GlassField';
import { PasswordField } from '../components/PasswordField';
import { SectionLabel } from '../components/SectionLabel';
import { formatDateInput } from '../format';
import { useSession } from '../hooks/useSession';
import { ROUTES } from '../navigation/routes';

interface Draft {
  readonly handle: string;
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
  readonly confirm: string;
  readonly dateOfBirth: string;
}

const EMPTY_DRAFT: Draft = {
  handle: '',
  displayName: '',
  email: '',
  password: '',
  confirm: '',
  dateOfBirth: '',
};

const validate = (draft: Draft): string | null => {
  if (!draft.handle.trim() || !draft.email.trim() || !draft.password) {
    return 'Username, email and password are required.';
  }
  if (draft.password !== draft.confirm) return 'Those passwords do not match.';
  if (!draft.dateOfBirth) return 'Select your date of birth.';
  return null;
};

export const SignUpScreen = () => {
  const { signUp, isSigningUp } = useSession();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const update = <K extends keyof Draft>(key: K) =>
    (event: { target: { value: string } }) =>
      setDraft(current => ({ ...current, [key]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSigningUp) return;

    const invalid = validate(draft);
    if (invalid) {
      setFailure(invalid);
      return;
    }

    setFailure(null);
    setNotice(null);

    try {
      await signUp({
        handle: draft.handle.trim().toLowerCase(),
        displayName: draft.displayName.trim() || draft.handle.trim(),
        email: draft.email.trim().toLowerCase(),
        password: draft.password,
        dateOfBirth: draft.dateOfBirth,
      });
      setNotice(
        `Account created. Check ${draft.email.trim()} for the verification link, then log in.`,
      );
    } catch (error) {
      setFailure(messageOf(error, 'Could not create your account.'));
    }
  };

  return (
    <AuthPanel
      title="Create an account"
      subtitle="Join PreQuit — the eye of internet."
      tone="bright"
    >
      <form onSubmit={submit} className="mt-7 flex flex-col gap-3.5">
        <SectionLabel>Account information</SectionLabel>

        <GlassField
          type="text"
          name="handle"
          autoComplete="username"
          placeholder="Username"
          aria-label="Username"
          value={draft.handle}
          onChange={update('handle')}
        />

        <GlassField
          type="text"
          name="displayName"
          autoComplete="name"
          placeholder="Display Name"
          aria-label="Display name"
          value={draft.displayName}
          onChange={update('displayName')}
        />

        <GlassField
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          value={draft.email}
          onChange={update('email')}
        />

        <PasswordField
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          aria-label="Password"
          value={draft.password}
          onChange={update('password')}
        />

        <PasswordField
          name="confirm"
          autoComplete="new-password"
          placeholder="Re-enter Password"
          aria-label="Re-enter password"
          value={draft.confirm}
          onChange={update('confirm')}
        />

        <GlassField
          type="date"
          name="dateOfBirth"
          max={formatDateInput(new Date())}
          aria-label="Date of birth"
          value={draft.dateOfBirth}
          onChange={update('dateOfBirth')}
          className="[color-scheme:dark]"
        />

        <FormError message={failure} />
        <FormNotice message={notice} />

        <GlassButton type="submit" tone="primary" disabled={isSigningUp} className="mt-1">
          {isSigningUp ? 'Creating…' : 'Create Account'}
        </GlassButton>

        <p className="text-center text-sm text-white/60">
          Already registered?{' '}
          <Link href={ROUTES.SIGN_IN} className="font-semibold text-paper hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
};
