import type { Metadata, Viewport } from 'next';
import { Anton, Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { AmbientBackdrop } from '@/src/presentation/components/AmbientBackdrop';
import './globals.css';
import { Providers } from './providers';

const display = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display-family',
  display: 'swap',
});

const body = Inter({
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
