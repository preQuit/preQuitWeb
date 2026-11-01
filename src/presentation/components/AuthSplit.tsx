'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Emblem } from './Emblem';
import { SolarSystem } from './SolarSystem';

/**
 * The shell every auth screen renders through: brand on the left, the form
 * card on the right. Below `lg` there is no room for two columns, so the
 * brand collapses to a compact header above the card. Screens supply the
 * title and form fields only — the chrome is defined once, here.
 */
export interface AuthSplitProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly backHref?: string;
  readonly children: ReactNode;
}

export const AuthSplit = ({ title, subtitle, backHref, children }: AuthSplitProps) => (
  <main className="flex min-h-dvh flex-col lg:flex-row">
    <section className="flex flex-col items-center justify-center gap-5 px-8 pt-12 pb-6 lg:flex-1 lg:gap-10 lg:px-16 lg:py-16">
      <div className="flex items-center gap-3 lg:flex-col lg:gap-5">
        <Emblem size={52} className="lg:hidden" />
        <Emblem size={136} className="hidden lg:block" />
        <div className="flex flex-col items-start lg:items-center">
          <h1 className="display-title text-3xl text-paper lg:text-5xl">PreQuit</h1>
          <p className="hidden text-sm tracking-[0.3em] text-muted uppercase lg:block">
            Eye of Internet
          </p>
        </div>
      </div>
      <div className="hidden lg:block">
        <SolarSystem />
      </div>
    </section>

    <section className="flex w-full flex-col items-center justify-center px-5 pb-12 lg:w-[460px] lg:shrink-0 lg:border-l lg:border-line lg:px-10 lg:py-10">
      <div className="surface-raised w-full max-w-sm animate-panel-expand rounded-card">
        <header className="rule flex items-center gap-3 px-6 py-4">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-2 flex size-7 items-center justify-center rounded-control text-muted transition-colors hover:bg-cobalt/14 hover:text-paper"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-paper">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
          </div>
        </header>

        <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
      </div>
    </section>
  </main>
);
