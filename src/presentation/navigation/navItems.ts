import {
  AtSign,
  Home,
  Mail,
  MessagesSquare,
  Search,
  Settings,
  User,
  UserRoundSearch,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { User as AppUser } from '../../domain/entities/User';
import { NAV_ICONS } from './navIcons';
import { SOCIAL_GRAPH_ROUTES } from './socialRoutes';
import { ROUTES } from './routes';

/**
 * One description of the app's navigation, rendered two ways: as the desktop
 * side rail and as the small-screen tab bar. Keeping a second list per
 * component is how the same destination ends up with two different names.
 */
export interface NavItem {
  readonly href: string;
  readonly label: string;
  /** Always present: the tab bar draws this, and it backs up `animatedIcon`. */
  readonly icon: LucideIcon;
  /** Side-rail only. Absent means the row simply renders `icon`. */
  readonly animatedIcon?: string;
  /**
   * Optional trailing value, mirroring the reference layout's "3"/"English".
   * Declared as an accessor so adding one never means teaching the component
   * about a new field on the profile.
   */
  trailing?(user: AppUser): string | null;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { href: ROUTES.FEED, label: 'Feed', icon: Home, animatedIcon: NAV_ICONS.feed },
  { href: ROUTES.SEARCH, label: 'Search', icon: Search, animatedIcon: NAV_ICONS.search },
  { href: ROUTES.CHATS, label: 'Messages', icon: MessagesSquare, animatedIcon: NAV_ICONS.messages },
  {
    href: ROUTES.PROFILE,
    label: 'Profile',
    icon: User,
    animatedIcon: NAV_ICONS.profile,
    trailing: user => (user.counts.posts > 0 ? String(user.counts.posts) : null),
  },
];

/**
 * Desktop-only (SideRail). GlassTabBar renders PRIMARY_NAV only, so these
 * stay reachable on small screens through the links ProfileScreen already
 * gives them rather than a fifth tab-bar icon.
 */
export const SECONDARY_NAV: readonly NavItem[] = [
  {
    href: ROUTES.PEOPLE,
    label: 'Find people',
    icon: UserRoundSearch,
    animatedIcon: NAV_ICONS.people,
  },
  {
    href: SOCIAL_GRAPH_ROUTES.root,
    label: 'Friends',
    icon: Users,
    animatedIcon: NAV_ICONS.friends,
    trailing: user => (user.counts.following > 0 ? String(user.counts.following) : null),
  },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings, animatedIcon: NAV_ICONS.settings },
];

export interface NavSection {
  readonly id: string;
  readonly items: readonly NavItem[];
}

/**
 * The side rail's grouped cards, in render order. A new group — or a new row
 * in an existing one — is a change here only; SideRail walks whatever it finds.
 */
export const SIDEBAR_SECTIONS: readonly NavSection[] = [
  { id: 'browse', items: PRIMARY_NAV },
  { id: 'social', items: SECONDARY_NAV },
];

/**
 * Read-only rows in the identity card. Deliberately a separate shape from
 * NavItem: these carry a value and go nowhere, so giving them an `href` they
 * would never use just to share one interface would be the wrong trade.
 */
export interface IdentityRow {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly animatedIcon?: string;
  value(user: AppUser): string;
}

export const IDENTITY_ROWS: readonly IdentityRow[] = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    animatedIcon: NAV_ICONS.email,
    value: user => user.email ?? 'Not set',
  },
  {
    id: 'username',
    label: 'Username',
    icon: AtSign,
    animatedIcon: NAV_ICONS.username,
    value: user => (user.handle ? `@${user.handle}` : 'Not set'),
  },
];

export const isCurrent = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
