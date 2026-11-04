'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, ShieldOff, UserX, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { viewerRelationshipOf } from '../../../application/social/relationship';
import { messageOf } from '../../../domain/errors/AppError';
import { Avatar } from '../../components/Avatar';
import { FollowButton } from '../../components/FollowButton';
import { GlassButton } from '../../components/GlassButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { Spinner } from '../../components/Spinner';
import { useUseCases } from '../../container/DependencyProvider';
import { formatCount } from '../../format';
import { useFollowAction } from '../../hooks/useFollowAction';
import { useOpenConversation } from '../../hooks/useOpenConversation';
import { useSocialProfile } from '../../hooks/useSocialProfile';
import { conversationRoute } from '../../navigation/routes';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';
import { queryKeys } from '../../query/queryKeys';

interface StatProps {
  readonly value: number;
  readonly label: string;
}

const Stat = ({ value, label }: StatProps) => (
  <div className="flex flex-1 flex-col items-center gap-1">
    <span className="text-lg font-bold text-paper">{formatCount(value)}</span>
    <span className="text-[11px] font-medium text-muted">{label}</span>
  </div>
);

interface StatLinkProps extends StatProps {
  readonly href: string;
}

const StatLink = ({ value, label, href }: StatLinkProps) => (
  <Link href={href} className="flex flex-1 flex-col items-center gap-1">
    <span className="text-lg font-bold text-paper">{formatCount(value)}</span>
    <span className="text-[11px] font-medium text-muted">{label}</span>
  </Link>
);

export const UserProfileScreen = () => {
  const router = useRouter();
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? '';
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const { user, isLoading, error } = useSocialProfile(handle);
  const { open, isOpening } = useOpenConversation();
  const relationship = viewerRelationshipOf(user);
  const { isHidden: followHidden } = useFollowAction(user);

  const muteMutation = useMutation({
    mutationFn: () =>
      relationship?.isMuted
        ? useCases.unmuteUser.execute(user?.id ?? '')
        : useCases.muteUser.execute(user?.id ?? ''),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(handle) }),
  });

  const blockMutation = useMutation({
    mutationFn: () =>
      relationship?.isBlocked
        ? useCases.unblockUser.execute(user?.id ?? '')
        : useCases.blockUser.execute(user?.id ?? ''),
    onSuccess: () => {
      // Blocking makes this profile 404 for both sides, so there is nowhere
      // useful left on this screen to land — the blocked list is.
      if (!relationship?.isBlocked) router.push(SOCIAL_GRAPH_ROUTES.blocked);
      else void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(handle) });
    },
  });

  const messageAuthor = async () => {
    if (!user) return;
    const conversationId = await open(user.id).catch(() => null);
    if (conversationId) router.push(conversationRoute(conversationId));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user || !relationship) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[15px] font-semibold text-paper">Profile unavailable</p>
        <p className="text-sm text-muted">{messageOf(error, 'This account could not be found.')}</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col pt-10">
      <ScreenHeader title={`@${user.handle}`} backHref={SOCIAL_GRAPH_ROUTES.root} />

      <section className="flex flex-col items-center px-6">
        <Avatar name={user.displayName} url={user.avatarUrl} size="xl" />
        <h1 className="mt-4 text-2xl font-bold text-paper">{user.displayName}</h1>
        <p className="mt-0.5 text-sm font-medium text-muted">@{user.handle}</p>
        {user.bio ? (
          <p className="mt-1.5 max-w-sm text-center text-[13px] leading-5 text-paper">{user.bio}</p>
        ) : null}

        {relationship.isSelf ? (
          <p className="surface-subtle mt-4 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-muted">
            This is you
          </p>
        ) : (
          <div className="mt-4 flex items-center gap-2.5">
            {!followHidden ? <FollowButton user={user} /> : null}
            {relationship.canMessage ? (
              <GlassButton tone="outline" disabled={isOpening} onClick={messageAuthor}>
                <MessageCircle size={16} />
                Message
              </GlassButton>
            ) : null}
          </div>
        )}
      </section>

      <section className="surface mx-6 mt-5 flex divide-x divide-line rounded-2xl py-3.5">
        <Stat value={user.counts.posts} label="Posts" />
        <StatLink
          value={user.counts.followers}
          label="Followers"
          href={SOCIAL_GRAPH_ROUTES.followers(user.handle)}
        />
        <StatLink
          value={user.counts.following}
          label="Following"
          href={SOCIAL_GRAPH_ROUTES.following(user.handle)}
        />
      </section>

      {!relationship.isSelf ? (
        <section className="mt-6 flex flex-col gap-3 px-6">
          <SectionLabel>Manage</SectionLabel>
          <div className="flex gap-3">
            <GlassButton tone="quiet" onClick={() => muteMutation.mutate()} disabled={muteMutation.isPending}>
              {relationship.isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {relationship.isMuted ? 'Unmute' : 'Mute'}
            </GlassButton>
            <GlassButton tone="quiet" onClick={() => blockMutation.mutate()} disabled={blockMutation.isPending}>
              <UserX size={16} />
              {relationship.isBlocked ? 'Unblock' : 'Block'}
            </GlassButton>
          </div>
        </section>
      ) : null}

      {user.topTopics.length > 0 ? (
        <section className="mt-7 flex flex-col gap-3 px-6">
          <SectionLabel>Top topics</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {user.topTopics.map(topic => (
              <span
                key={topic.slug}
                className="surface rounded-full px-3.5 py-2 text-[13px] font-semibold text-paper"
              >
                {topic.label}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {relationship.isBlocked ? (
        <p className="mt-6 flex items-center justify-center gap-2 px-6 text-center text-[13px] text-muted">
          <ShieldOff size={14} /> You have blocked this account.
        </p>
      ) : null}
    </main>
  );
};
