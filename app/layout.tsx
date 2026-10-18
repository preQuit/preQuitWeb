import type { Metadata, Viewport } from 'next';
import { Exo_2, Titillium_Web } from 'next/font/google';
import type { ReactNode } from 'react';

import { AmbientBackdrop } from '@/src/presentation/components/AmbientBackdrop';
import './globals.css';
import { Providers } from './providers';

// Segoe UI is the real Vista/7 face and is used first when the client has it.
// Titillium Web (2008) is the era-matched humanist fallback; Exo 2 carries the
// wider techno display voice that Frutiger Aero layouts leaned on.
const display = Exo_2({
  weight: ['300', '500', '700'],
  subsets: ['latin'],
  variable: '--font-display-family',
  display: 'swap',
});

const body = Titillium_Web({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body-family',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PreQuit',
  description: 'PreQuit — the eye of internet.',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" className={`${display.variable} ${body.variable}`}>
    <body className="min-h-dvh">
      <AmbientBackdrop />
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
