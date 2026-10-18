import { Home, MessagesSquare, Search, Settings, User, type LucideIcon } from 'lucide-react';

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
  { href: ROUTES.SOCIAL, label: 'Feed', icon: Home },
  { href: ROUTES.HOME, label: 'Search', icon: Search },
  { href: ROUTES.CHATS, label: 'Messages', icon: MessagesSquare },
  { href: ROUTES.PROFILE, label: 'Profile', icon: User },
];

export const SECONDARY_NAV: readonly NavItem[] = [
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export const isCurrent = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
