export const instant = false;

import type { ReactNode } from 'react';

import { RequireSession } from '@/src/presentation/navigation/RouteGuard';
import { AppChrome } from './AppChrome';

export interface AppLayoutProps {
  readonly children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <RequireSession>
    <AppChrome>{children}</AppChrome>
  </RequireSession>
);

export default AppLayout;
