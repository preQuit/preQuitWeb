import type { Metadata, Viewport } from 'next';
import { Archivo, Inter } from 'next/font/google';
import { Suspense, type ReactNode } from 'react';

import { Spinner } from '@/src/presentation/components/Spinner';
import './globals.css';
import { Providers } from './providers';

// The mobile app sets display type in Impact / sans-serif-black. Archivo
// carries that same heavy, slightly condensed voice and renders identically on
// every platform, which Impact does not.
const display = Archivo({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display-family',
  display: 'swap',
});

const body = Inter({
  weight: ['400', '500', '600', '700'],
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
  viewportFit: 'cover',
  // Browsers default to 'resizes-visual', which leaves the layout viewport —
  // and every vh/dvh unit — at full height when the keyboard opens, so a
  // focused composer scrolls the whole chat and takes the header off screen.
  // 'resizes-content' shrinks the layout viewport instead, letting the thread
  // pane absorb the loss while the header and composer stay put.
  interactiveWidget: 'resizes-content',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width',
};

export interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" className={`${display.variable} ${body.variable}`}>
    <body className="min-h-dvh">
      <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><Spinner /></div>}>
        <Providers>{children}</Providers>
      </Suspense>
    </body>
  </html>
);

export default RootLayout;
