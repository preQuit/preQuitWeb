'use client';

import { SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { isCurrent, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from '../navigation/navItems';
import { ROUTES } from '../navigation/routes';
import { AeroEmblem } from './AeroEmblem';
import { ComposerDialog } from './ComposerDialog';
import { GlassButton } from './GlassButton';

const Item = ({ item, current }: { item: NavItem; current: boolean }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={current ? 'page' : undefined}
      title={item.label}
      className={`flex h-11 items-center gap-3.5 rounded-control px-3 transition-colors duration-150 ${
        current
          ? 'aero-active text-paper'
          : 'border border-transparent text-muted hover:bg-white/7 hover:text-paper'
      }`}
    >
      <Icon size={20} strokeWidth={current ? 2.2 : 1.7} className="shrink-0" />
      <span className="hidden truncate text-sm font-semibold aero-text-shadow xl:inline">
        {item.label}
      </span>
    </Link>
  );
};

/**
 * Desktop navigation. Collapses to an icon rail below xl and disappears
 * entirely on small screens, where GlassTabBar takes over.
 */
export const SideRail = () => {
  const pathname = usePathname();
  const [composing, setComposing] = useState(false);

  return (
    <>
    <nav className="glass-bar fixed inset-y-0 left-0 z-30 hidden w-rail flex-col gap-1 border-y-0 border-l-0 px-3 py-5 md:flex xl:w-rail-wide">
      <Link
        href={ROUTES.SOCIAL}
        className="mb-4 flex items-center gap-3 px-1 transition-opacity hover:opacity-80"
      >
        <AeroEmblem size={34} className="shrink-0" />
        <span className="hidden font-display text-lg font-semibold text-paper aero-text-shadow xl:inline">
          PreQuit
        </span>
      </Link>

      <div className="flex flex-col gap-1">
        {PRIMARY_NAV.map(item => (
          <Item key={item.href} item={item} current={isCurrent(pathname, item.href)} />
        ))}
      </div>

      <GlassButton
        tone="primary"
        onClick={() => setComposing(true)}
        title="Create a post"
        className="mt-3 w-full justify-center px-0 xl:px-6"
      >
        <SquarePen size={17} />
        <span className="hidden xl:inline">Create</span>
      </GlassButton>

      <div className="mt-auto flex flex-col gap-1">
        {SECONDARY_NAV.map(item => (
          <Item key={item.href} item={item} current={isCurrent(pathname, item.href)} />
        ))}
      </div>
    </nav>

      <ComposerDialog open={composing} onClose={() => setComposing(false)} />
    </>
  );
};
