'use client';

import { SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { isCurrent, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from '../navigation/navItems';
import { ROUTES } from '../navigation/routes';
import { Emblem } from './Emblem';
import { GlassButton } from './GlassButton';

const Item = ({ item, current, expanded }: { item: NavItem; current: boolean; expanded: boolean }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={current ? 'page' : undefined}
      title={item.label}
      className={`flex h-11 items-center gap-3.5 rounded-control px-3 transition-colors duration-150 ${
        current
          ? 'nav-active text-paper'
          : 'border border-transparent text-muted hover:bg-cobalt/12 hover:text-paper'
      }`}
    >
      <Icon size={20} strokeWidth={current ? 2.2 : 1.7} className="shrink-0" />
      {expanded && <span className="truncate text-sm font-semibold">{item.label}</span>}
    </Link>
  );
};

/**
 * Desktop navigation. Collapses to an icon rail below xl and disappears
 * entirely on small screens, where GlassTabBar takes over.
 */
export interface SideRailProps {
  readonly onCompose: () => void;
}

export const SideRail = ({ onCompose }: SideRailProps) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      aria-label="Primary"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`bar fixed inset-y-0 left-0 z-30 hidden flex-col gap-1 border-y-0 border-l-0 px-3 py-5 transition-all duration-200 md:flex ${
        expanded ? 'w-48' : 'w-rail'
      }`}
    >
      <Link
        href={ROUTES.FEED}
        className="mb-4 flex items-center gap-3 px-1 transition-opacity hover:opacity-80"
      >
        <Emblem size={34} className="shrink-0" />
        {expanded && <span className="font-display text-lg font-semibold text-paper">PreQuit</span>}
      </Link>

      <div className="flex flex-col gap-1">
        {PRIMARY_NAV.map(item => (
          <Item key={item.href} item={item} current={isCurrent(pathname, item.href)} expanded={expanded} />
        ))}
      </div>

      <GlassButton
        tone="primary"
        onClick={onCompose}
        title="Create a post"
        className={`mt-3 w-full h-11 transition-all ${expanded ? 'justify-start px-3' : 'justify-center px-3'}`}
      >
        <SquarePen size={17} className="shrink-0" />
        {expanded && <span className="truncate text-sm font-semibold">Create</span>}
      </GlassButton>

      <div className="mt-auto flex flex-col gap-1">
        {SECONDARY_NAV.map(item => (
          <Item key={item.href} item={item} current={isCurrent(pathname, item.href)} expanded={expanded} />
        ))}
      </div>
    </nav>
  );
};
