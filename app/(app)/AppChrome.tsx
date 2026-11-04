'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { ComposerDialog } from '@/src/presentation/components/ComposerDialog';
import { GlassTabBar } from '@/src/presentation/components/GlassTabBar';
import { SideRail } from '@/src/presentation/components/SideRail';
import { ROUTES } from '@/src/presentation/navigation/routes';

/**
 * Owns the composer state because both navigation surfaces open it and only
 * one of them is mounted at a given viewport width. The dialog lives here, as
 * a sibling of the rail rather than a child, so its fixed positioning resolves
 * against the viewport instead of the rail's backdrop-filter containing block.
 *
 * Max-width is never set here — each screen picks its own via `mx-auto
 * w-full max-w-*` on its own root. Horizontal gutter and tab-bar clearance
 * ARE set here, as the one default every screen gets for free, because
 * screens this phase does not own (`/social-graph/**`) still mount under
 * this chrome and have no frame of their own to fall back on.
 *
 * The one documented exception: a conversation thread manages its own
 * edge-to-edge header/composer with its own clearance (DirectMessageScreen),
 * so it bleeds past this default rather than doubling up on it, and the tab
 * bar is unmounted there so it cannot overlap that composer. Route-aware is
 * not pretty, but splitting the frame into a float-away wrapper component
 * would just move the same conditional into every screen instead of here.
 */
export const AppChrome = ({ children }: { readonly children: ReactNode }) => {
  const [composing, setComposing] = useState(false);
  const open = () => setComposing(true);
  const pathname = usePathname();
  // A conversation thread is a focused, full-height surface with its own
  // composer pinned to the bottom edge. The floating tab bar would sit on top
  // of that composer on mobile, so the thread replaces the nav rather than
  // stacking under it — the back arrow in its header is the way out.
  const inThread = pathname.startsWith(`${ROUTES.CHATS}/`);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-control focus:bg-lime focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <SideRail onCompose={open} />
      <div className="pl-rail">
        <div className={inThread ? '' : 'px-4 tabbar-clear md:pb-0'}>{children}</div>
      </div>
      {inThread ? null : <GlassTabBar onCompose={open} />}
      <ComposerDialog open={composing} onClose={() => setComposing(false)} />
    </>
  );
};
