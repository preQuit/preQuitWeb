'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ScreenHeaderProps {
  readonly title: string;
  readonly backHref?: string;
  readonly actions?: ReactNode;
}

export const ScreenHeader = ({ title, backHref, actions }: ScreenHeaderProps) => (
  <header className="flex items-center gap-2 px-5 pt-6 pb-4">
    {backHref ? (
      <Link
        href={backHref}
        aria-label="Go back"
        className="-ml-2 text-paper transition-opacity hover:opacity-70"
      >
        <ChevronLeft size={28} />
      </Link>
    ) : null}
    <h1 className="display-title flex-1 text-[28px] text-paper">{title}</h1>
    {actions}
  </header>
);
