'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';

import { messageOf } from '../../domain/errors/AppError';
import { AeroEmblem } from '../components/AeroEmblem';
import { AuthPanel } from '../components/AuthPanel';
import { FormError } from '../components/FormError';
import { GlassButton } from '../components/GlassButton';
import { GlassField } from '../components/GlassField';
import { PasswordField } from '../components/PasswordField';
import { useSession } from '../hooks/useSession';
import { ROUTES } from '../navigation/routes';

export const SignInScreen = () => {
  const router = useRouter();
  const { signIn, isSigningIn } = useSession();
  const fieldId = useId();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSigningIn) return;

    if (!identifier.trim() || !password) {
      setFailure('Enter your username and password.');
      return;
    }

    setFailure(null);
    try {
      await signIn({ identifier, password });
      router.replace(ROUTES.HOME);
    } catch (error) {
      setFailure(messageOf(error, 'Could not sign you in.'));
    }
  };

  return (
    <AuthPanel title="Welcome to PreQuit" aside={<AeroEmblem size={148} />}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <GlassField
          id={`${fieldId}-identifier`}
          label="User Name:"
          type="text"
          name="identifier"
          autoComplete="username"
          autoFocus
          value={identifier}
          onChange={event => setIdentifier(event.target.value)}
        />

        <PasswordField
          id={`${fieldId}-password`}
          label="Password:"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
        />

        <FormError message={failure} />

        <div className="flex justify-end pt-1">
          <GlassButton type="submit" tone="primary" disabled={isSigningIn} className="min-w-28">
            {isSigningIn ? 'Signing In…' : 'Sign In'}
          </GlassButton>
        </div>

        <div className="flex flex-col items-end gap-1 pt-1 text-sm">
          <Link
            href={ROUTES.SIGN_UP}
            className="text-aero-cyan transition-colors hover:text-paper hover:underline"
          >
            Create an account
          </Link>
          <Link
            href={ROUTES.RESET_PASSWORD}
            className="text-aero-cyan transition-colors hover:text-paper hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </AuthPanel>
  );
};
