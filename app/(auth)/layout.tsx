export const instant = false;

import type { ReactNode } from 'react';

import { RequireGuest } from '@/src/presentation/navigation/RouteGuard';

export interface AuthLayoutProps {
  readonly children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => <RequireGuest>{children}</RequireGuest>;

export default AuthLayout;
