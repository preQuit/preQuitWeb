'use client';

import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { messageOf } from '../../domain/errors/AppError';
import { AuthPanel } from '../components/AuthPanel';
import { FormError } from '../components/FormError';
import { FormNotice } from '../components/FormNotice';
import { GlassButton } from '../components/GlassButton';
import { GlassField } from '../components/GlassField';
import { SectionLabel } from '../components/SectionLabel';
import { useUseCases } from '../container/DependencyProvider';
import { ROUTES } from '../navigation/routes';

export const ResetPasswordScreen = () => {
  const useCases = useUseCases();
  const [email, setEmail] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const request = useMutation({
    mutationFn: (address: string) => useCases.requestPasswordReset.execute(address),
    onSuccess: () => setNotice('If that address has an account, a reset link is on its way.'),
    onError: error => setFailure(messageOf(error, 'Could not send the reset link.')),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (request.isPending) return;

    if (!email.trim()) {
      setFailure('Enter the email on your account.');
      return;
    }

    setFailure(null);
    setNotice(null);
    request.mutate(email);
  };

  return (
    <AuthPanel
      title="Reset your password"
      subtitle="We will email you a link to set a new one."
      backHref={ROUTES.SIGN_IN}
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <SectionLabel>Account email</SectionLabel>

        <GlassField
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <FormError message={failure} />
        <FormNotice message={notice} />

        <GlassButton type="submit" tone="primary" disabled={request.isPending} className="mt-2">
          {request.isPending ? 'Sending…' : 'Send reset link'}
        </GlassButton>
      </form>
    </AuthPanel>
  );
};
