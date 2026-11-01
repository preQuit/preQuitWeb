'use client';

import { Check, Inbox, X } from 'lucide-react';
import { useState } from 'react';

import { FollowRequestDirection, type FollowRequestDirectionValue } from '../../../domain/repositories/SocialRepository';
import { EmptyState } from '../../components/EmptyState';
import { GlassButton } from '../../components/GlassButton';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Spinner } from '../../components/Spinner';
import { useFollowRequestsInbox } from '../../hooks/useFollowRequestsInbox';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

const TABS: ReadonlyArray<{ key: FollowRequestDirectionValue; label: string }> = [
  { key: FollowRequestDirection.INCOMING, label: 'Incoming' },
  { key: FollowRequestDirection.OUTGOING, label: 'Outgoing' },
];

export const FollowRequestsScreen = () => {
  const [direction, setDirection] = useState<FollowRequestDirectionValue>(FollowRequestDirection.INCOMING);
  const { items, isLoading, isActing, accept, reject, cancel } = useFollowRequestsInbox(direction);
  const incoming = direction === FollowRequestDirection.INCOMING;

  return (
    <main className="flex flex-col pt-10">
      <ScreenHeader title="Follow requests" backHref={SOCIAL_GRAPH_ROUTES.root} />

      <div className="flex gap-2 px-5 pb-4" role="tablist" aria-label="Follow request direction">
        {TABS.map(tab => {
          const active = tab.key === direction;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDirection(tab.key)}
              className={`rounded-2xl px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                active ? 'bg-cobalt text-paper' : 'surface text-muted hover:text-paper'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={incoming ? 'No incoming requests' : 'No outgoing requests'}
          body={
            incoming
              ? 'Requests to follow you will show up here.'
              : 'Accounts you have asked to follow will show up here.'
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {items.map(item => (
            <PersonRow
              key={item.id}
              userId={incoming ? item.requesterId : item.targetId}
              since={item.createdAt}
              trailing={
                incoming ? (
                  <div className="flex gap-2">
                    <GlassButton
                      tone="secondary"
                      size="control"
                      disabled={isActing}
                      onClick={() => accept(item.id)}
                    >
                      <Check size={14} />
                      Accept
                    </GlassButton>
                    <GlassButton tone="quiet" size="control" disabled={isActing} onClick={() => reject(item.id)}>
                      <X size={14} />
                      Reject
                    </GlassButton>
                  </div>
                ) : (
                  <GlassButton tone="quiet" size="control" disabled={isActing} onClick={() => cancel(item.id)}>
                    <X size={14} />
                    Cancel
                  </GlassButton>
                )
              }
            />
          ))}
        </div>
      )}
    </main>
  );
};
