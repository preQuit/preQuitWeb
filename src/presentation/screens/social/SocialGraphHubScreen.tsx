'use client';

import { ChevronRight, Heart, Inbox, Pencil, ShieldOff, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { ScreenHeader } from '../../components/ScreenHeader';
import { useSession } from '../../hooks/useSession';
import { SOCIAL_GRAPH_ROUTES } from '../../navigation/socialRoutes';

interface HubLinkProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: string;
  readonly href: string;
}

const HubLink = ({ icon: Icon, title, body, href }: HubLinkProps) => (
  <Link href={href} className="surface flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-cobalt/10">
    <span className="surface-subtle flex size-11 shrink-0 items-center justify-center rounded-full text-paper">
      <Icon size={19} />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[14px] font-semibold text-paper">{title}</span>
      <span className="truncate text-[12px] text-muted">{body}</span>
    </span>
    <ChevronRight size={18} className="shrink-0 text-faint" />
  </Link>
);

/**
 * `/social-graph` is not wired into AppChrome's nav yet — this phase owns no
 * nav file. Until that link is added, every screen built here is reachable
 * from this hub plus the entry points added to ProfileScreen.
 */
export const SocialGraphHubScreen = () => {
  const { user } = useSession();

  return (
    <main className="flex flex-col gap-3 px-6 pt-10">
      <ScreenHeader title="Friends & requests" />

      {user ? (
        <HubLink
          icon={Users}
          title="Your followers"
          body="See who follows you"
          href={SOCIAL_GRAPH_ROUTES.followers(user.handle)}
        />
      ) : null}
      {user ? (
        <HubLink
          icon={Users}
          title="Your following"
          body="See who you follow"
          href={SOCIAL_GRAPH_ROUTES.following(user.handle)}
        />
      ) : null}
      <HubLink icon={Heart} title="Friends" body="Mutual follows" href={SOCIAL_GRAPH_ROUTES.friends} />
      <HubLink icon={Inbox} title="Follow requests" body="Incoming and outgoing" href={SOCIAL_GRAPH_ROUTES.requests} />
      <HubLink icon={Sparkles} title="Discover people" body="Suggested accounts" href={SOCIAL_GRAPH_ROUTES.discover} />
      <HubLink icon={ShieldOff} title="Blocked & muted" body="Manage restricted accounts" href={SOCIAL_GRAPH_ROUTES.blocked} />
      <HubLink icon={Pencil} title="Edit profile" body="Name, bio, privacy, links" href={SOCIAL_GRAPH_ROUTES.editProfile} />
    </main>
  );
};
