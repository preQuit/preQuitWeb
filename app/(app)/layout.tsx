export const instant = false;

import type { ReactNode } from 'react';

import { GlassTabBar } from '@/src/presentation/components/GlassTabBar';
import { RequireSession } from '@/src/presentation/navigation/RouteGuard';

export interface AppLayoutProps {
  readonly children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <RequireSession>
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col pb-28">{children}</div>
    <GlassTabBar />
  </RequireSession>
);

export default AppLayout;
