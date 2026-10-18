'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { messageOf } from '../../domain/errors/AppError';
import { AuthPanel } from '../components/AuthPanel';
import { FormError } from '../components/FormError';
import { GlassButton } from '../components/GlassButton';
import { GlassField } from '../components/GlassField';
import { PasswordField } from '../components/PasswordField';
import { SectionLabel } from '../components/SectionLabel';
import { useSession } from '../hooks/useSession';
import { ROUTES } from '../navigation/routes';

export const SignInScreen = () => {
  const router = useRouter();
  const { signIn, isSigningIn } = useSession();
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
    <AuthPanel title="Welcome back!" subtitle="We're so excited to see you again!">
      <form onSubmit={submit} className="mt-8 flex flex-col gap-3.5">
        <SectionLabel>Account information</SectionLabel>

        <GlassField
          type="text"
          name="identifier"
          autoComplete="username"
          placeholder="Email or Username"
          aria-label="Email or username"
          value={identifier}
          onChange={event => setIdentifier(event.target.value)}
        />

        <PasswordField
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={event => setPassword(event.target.value)}
        />

        <Link
          href={ROUTES.RESET_PASSWORD}
          className="w-fit text-sm text-white/70 transition-colors hover:text-paper"
        >
          Forgot your password?
        </Link>

        <FormError message={failure} />

        <GlassButton type="submit" tone="solid" disabled={isSigningIn} className="mt-2">
          {isSigningIn ? 'Logging in…' : 'Log In'}
        </GlassButton>

        <p className="text-center text-sm text-white/60">
          Need an account?{' '}
          <Link href={ROUTES.SIGN_UP} className="font-semibold text-paper hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
};
