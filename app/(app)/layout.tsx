export const instant = false;

import type { ReactNode } from 'react';

import { GlassTabBar } from '@/src/presentation/components/GlassTabBar';
import { SideRail } from '@/src/presentation/components/SideRail';
import { RequireSession } from '@/src/presentation/navigation/RouteGuard';

export interface AppLayoutProps {
  readonly children: ReactNode;
}

/**
 * Desktop gets the left rail and a centred content column; small screens keep
 * the bottom tab bar. The rail is fixed, so the column is offset by its width
 * rather than sharing a flex row with it.
 */
const AppLayout = ({ children }: AppLayoutProps) => (
  <RequireSession>
    <SideRail />
    <div className="md:pl-rail xl:pl-rail-wide">
      <div className="mx-auto w-full max-w-2xl px-4 pb-28 md:pb-10">{children}</div>
    </div>
    <GlassTabBar />
  </RequireSession>
);

export default AppLayout;
