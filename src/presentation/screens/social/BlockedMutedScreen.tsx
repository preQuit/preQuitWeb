'use client';

import { ShieldOff, VolumeX } from 'lucide-react';

import { EmptyState } from '../../components/EmptyState';
import { GlassButton } from '../../components/GlassButton';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { Spinner } from '../../components/Spinner';
import { useSocialBlockedMuted } from '../../hooks/useSocialBlockedMuted';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

export const BlockedMutedScreen = () => {
  const { blockedIds, isLoading, isUnblocking, unblock } = useSocialBlockedMuted();

  return (
    <main className="flex flex-col gap-7 pt-10 pb-10">
      <ScreenHeader title="Blocked & muted" backHref={SOCIAL_GRAPH_ROUTES.root} />

      <section className="flex flex-col gap-3">
        <SectionLabel className="px-6">Blocked</SectionLabel>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : blockedIds.length === 0 ? (
          <EmptyState icon={ShieldOff} title="Nobody is blocked" />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {blockedIds.map(id => (
              <PersonRow
                key={id}
                userId={id}
                trailing={
                  <GlassButton tone="quiet" size="control" disabled={isUnblocking} onClick={() => unblock(id)}>
                    Unblock
                  </GlassButton>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel className="px-6">Muted</SectionLabel>
        <EmptyState
          icon={VolumeX}
          title="Muted accounts aren't listable yet"
          body="The API can mute and unmute an account but has no endpoint to list who is muted. Unmute someone from their profile instead."
        />
      </section>
    </main>
  );
};
