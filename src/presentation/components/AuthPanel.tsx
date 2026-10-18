'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The shell every auth screen renders through: an Aero dialog with a titled
 * header rule, an optional emblem column on the left, and the form on the
 * right. Screens supply content only — the chrome is defined once, here.
 */
export interface AuthPanelProps {
  readonly title: string;
  readonly subtitle?: string;
  /** Optional left column, e.g. the product emblem on sign-in. */
  readonly aside?: ReactNode;
  readonly backHref?: string;
  readonly width?: 'narrow' | 'wide';
  readonly children: ReactNode;
}

const WIDTHS = {
  narrow: 'max-w-md',
  wide: 'max-w-2xl',
} as const;

export const AuthPanel = ({
  title,
  subtitle,
  aside,
  backHref,
  width = aside ? 'wide' : 'narrow',
  children,
}: AuthPanelProps) => (
  <main className="flex min-h-dvh items-center justify-center px-4 py-10">
    <section
      className={`glass-raised aero-sheen w-full rounded-glass animate-panel-expand ${WIDTHS[width]}`}
    >
      <header className="aero-rule flex items-center gap-3 px-7 py-4">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-2 flex size-7 items-center justify-center rounded-control text-muted transition-colors hover:bg-white/8 hover:text-paper"
          >
            <ChevronLeft size={18} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold text-paper aero-text-shadow">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
        </div>
      </header>

      <div className="flex flex-col gap-7 px-7 py-7 sm:flex-row sm:items-start sm:gap-9">
        {aside && <div className="flex shrink-0 justify-center sm:pt-1">{aside}</div>}
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </section>
  </main>
);
