'use client';

import { Home, MessagesSquare, User, Users, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabDefinition {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

const TABS: readonly TabDefinition[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/social', label: 'Social', icon: MessagesSquare },
  { href: '/chats', label: 'Friends', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

const isCurrent = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export const GlassTabBar = () => {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-6 pb-5">
      <div className="glass-bar pointer-events-auto flex h-17 w-full max-w-lg items-center justify-around rounded-[34px] px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? 'page' : undefined}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span
                className={`absolute size-11 rounded-full border-[1.5px] border-white/25 bg-white/15 transition-all duration-200 ${
                  current ? '-translate-y-1.5 scale-100 opacity-100' : 'scale-60 opacity-0'
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
      </div>
    </nav>
  );
};
