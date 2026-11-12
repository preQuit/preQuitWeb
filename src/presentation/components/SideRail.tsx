'use client';

import { Search, SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { User } from '../../domain/entities/User';
import {
  IDENTITY_ROWS,
  isCurrent,
  SIDEBAR_SECTIONS,
  type IdentityRow,
  type NavItem,
} from '../navigation/navItems';
import { ROUTES } from '../navigation/routes';
import { useMyProfile } from '../hooks/useProfile';
import { Avatar } from './Avatar';
import { GlassButton } from './GlassButton';
import { NavGlyph } from './NavGlyph';

interface NavRowProps {
  readonly item: NavItem;
  readonly current: boolean;
  readonly user: User | null;
}

/**
 * A navigable menu row. Owns nothing but its own presentation — which item it
 * draws and whether that item is current are both decided by the caller.
 */
const NavRow = ({ item, current, user }: NavRowProps) => {
  // `trailing` is optional on NavItem and needs a loaded profile to resolve,
  // so a rail rendered before the profile arrives simply shows no value.
  const trailing = user && item.trailing ? item.trailing(user) : null;

  return (
    <Link
      href={item.href}
      aria-current={current ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
        current ? 'bg-cobalt/15' : 'hover:bg-cobalt/10'
      }`}
    >
      <NavGlyph animated={item.animatedIcon} fallback={item.icon} active={current} />
      <span
        className={`min-w-0 flex-1 truncate text-[14px] ${
          current ? 'font-semibold text-paper' : 'font-medium text-paper/85'
        }`}
      >
        {item.label}
      </span>
      {trailing ? <span className="shrink-0 text-[12px] text-muted">{trailing}</span> : null}
    </Link>
  );
};

interface IdentityRowViewProps {
  readonly row: IdentityRow;
  readonly user: User;
}

/**
 * A read-only identity row: value first, label beneath, matching the grouped
 * contact card in the reference layout.
 */
const IdentityRowView = ({ row, user }: IdentityRowViewProps) => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <NavGlyph animated={row.animatedIcon} fallback={row.icon} />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-[14px] font-medium text-paper">{row.value(user)}</span>
      <span className="text-[11px] text-muted">{row.label}</span>
    </span>
  </div>
);

const Card = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="surface divide-y divide-line overflow-hidden rounded-2xl">{children}</div>
);

export interface SideRailProps {
  readonly onCompose: () => void;
}

/**
 * Desktop navigation: a persistent panel of grouped cards — profile, identity,
 * then the nav sections — replacing the old hover-to-expand icon rail. Hidden
 * below `md`, where GlassTabBar takes over; the shell's content offset is
 * `md:pl-rail` so it is not reserved on screens this never renders on.
 */
export const SideRail = ({ onCompose }: SideRailProps) => {
  const pathname = usePathname();
  const { profile } = useMyProfile();

  return (
    <nav
      aria-label="Primary"
      className="bar fixed inset-y-0 left-0 z-30 hidden w-rail flex-col border-y-0 border-l-0 md:flex"
    >
      <header className="flex items-center gap-2.5 px-4 pt-5 pb-3">
        <Link
          href={ROUTES.FEED}
          className="flex min-w-0 flex-1 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="font-display truncate text-lg font-semibold text-paper">PreQuit</span>
        </Link>
        <Link
          href={ROUTES.SEARCH}
          aria-label="Search"
          className="shrink-0 text-muted transition-colors hover:text-paper"
        >
          <Search size={19} />
        </Link>
      </header>

      {/* The panel is fixed to the viewport, so the menu — not the page —
          has to absorb a short window or the last card becomes unreachable. */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
        <section className="flex flex-col items-center gap-1.5 pt-1 pb-1">
          <Avatar name={profile?.displayName || profile?.handle || '?'} url={profile?.avatarUrl} size="lg" />
          <span className="max-w-full truncate text-[15px] font-bold text-paper">
            {profile?.displayName || profile?.handle || 'Your profile'}
          </span>
          <span className="text-[12px] text-muted">
            {profile?.isPrivate ? 'Private account' : 'Public account'}
          </span>
        </section>

        {profile ? (
          <Card>
            {IDENTITY_ROWS.map(row => (
              <IdentityRowView key={row.id} row={row} user={profile} />
            ))}
          </Card>
        ) : null}

        {SIDEBAR_SECTIONS.map(section => (
          <Card key={section.id}>
            {section.items.map(item => (
              <NavRow
                key={item.href}
                item={item}
                current={isCurrent(pathname, item.href)}
                user={profile}
              />
            ))}
          </Card>
        ))}
      </div>

      <div className="px-3 pb-5">
        <GlassButton tone="primary" onClick={onCompose} className="h-11 w-full justify-center gap-2">
          <SquarePen size={17} className="shrink-0" />
          <span className="text-sm font-semibold">Create</span>
        </GlassButton>
      </div>
    </nav>
  );
};
