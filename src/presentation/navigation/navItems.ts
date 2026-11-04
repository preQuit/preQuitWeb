import { Home, MessagesSquare, Search, Settings, User, UserRoundSearch, Users, type LucideIcon } from 'lucide-react';

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
  readonly icon: LucideIcon;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { href: ROUTES.FEED, label: 'Feed', icon: Home },
  { href: ROUTES.SEARCH, label: 'Search', icon: Search },
  { href: ROUTES.CHATS, label: 'Messages', icon: MessagesSquare },
  { href: ROUTES.PROFILE, label: 'Profile', icon: User },
];

/**
 * Desktop-only (SideRail). GlassTabBar renders PRIMARY_NAV only, so these
 * stay reachable on small screens through the links ProfileScreen already
 * gives them rather than a fifth tab-bar icon.
 */
export const SECONDARY_NAV: readonly NavItem[] = [
  { href: ROUTES.PEOPLE, label: 'Find people', icon: UserRoundSearch },
  { href: SOCIAL_GRAPH_ROUTES.root, label: 'Friends', icon: Users },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export const isCurrent = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
