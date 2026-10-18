'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type PanelTone = 'dark' | 'bright';

const TONES: Readonly<Record<PanelTone, string>> = {
  dark: 'glass',
  bright: 'glass-raised',
};

export interface AuthPanelProps {
  readonly title: string;
  readonly subtitle: string;
  readonly tone?: PanelTone;
  readonly backHref?: string;
  readonly children: ReactNode;
}

export const AuthPanel = ({
  title,
  subtitle,
  tone = 'dark',
  backHref = '/',
  children,
}: AuthPanelProps) => (
  <main className="flex min-h-dvh items-center justify-center px-4 py-8">
    <section
      className={`${TONES[tone]} w-full max-w-md overflow-hidden rounded-3xl [animation:panel-expand_340ms_cubic-bezier(0.22,1,0.36,1)_both]`}
    >
      <div className="flex flex-col px-6 pt-4 pb-8 sm:px-8">
        <Link
          href={backHref}
          className="-ml-1.5 flex h-11 w-fit items-center gap-1 text-lg text-paper transition-opacity hover:opacity-70"
        >
          <ChevronLeft size={24} />
          Back
        </Link>

        <h1 className="mt-2 text-center text-3xl font-extrabold text-paper">{title}</h1>
        <p className="mt-2 text-center text-base text-white/70">{subtitle}</p>

        {children}
      </div>
    </section>
  </main>
);
