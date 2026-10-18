'use client';

import { SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isCurrent, PRIMARY_NAV } from '../navigation/navItems';

/**
 * Small-screen navigation. Renders the same destinations as SideRail from the
 * same list, so a route can never be called two different things depending on
 * viewport width.
 */
export interface GlassTabBarProps {
  readonly onCompose: () => void;
}

export const GlassTabBar = ({ onCompose }: GlassTabBarProps) => {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-6 pb-5 md:hidden">
      <div className="glass-bar pointer-events-auto flex h-17 w-full max-w-lg items-center justify-around rounded-[34px] px-2">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? 'page' : undefined}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span
                className={`absolute size-11 rounded-full transition-all duration-200 ${
                  current ? 'aero-active -translate-y-1.5 scale-100 opacity-100' : 'scale-60 opacity-0'
                }`}
              />
              <Icon
                size={23}
                strokeWidth={current ? 2.2 : 1.8}
                className={`relative transition-all duration-200 ${
                  current ? '-translate-y-1.5 text-paper' : 'text-muted'
                }`}
              />
              <span
                className={`absolute bottom-1.5 text-[10px] font-semibold text-paper transition-opacity duration-200 ${
                  current ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onCompose}
          aria-label="Create a post"
          className="relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-muted transition-colors hover:text-paper"
        >
          <SquarePen size={23} strokeWidth={1.8} />
        </button>
      </div>
    </nav>
  );
};
