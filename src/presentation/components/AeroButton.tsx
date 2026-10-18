'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type AeroTone = 'primary' | 'secondary' | 'quiet';

const BASE =
  'group relative inline-flex h-9 select-none items-center justify-center gap-2 px-5 ' +
  'text-[13px] font-semibold tracking-[0.01em] text-paper ' +
  'disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50';

const TONES: Readonly<Record<AeroTone, string>> = {
  primary: 'aero-button aero-button-primary hover:aero-button-hover',
  secondary: 'aero-button hover:aero-button-hover',
  quiet:
    'rounded-[5px] border border-transparent text-muted hover:border-white/12 ' +
    'hover:bg-white/6 hover:text-paper',
};

export interface AeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly tone?: AeroTone;
  readonly children: ReactNode;
}

export const AeroButton = ({
  tone = 'secondary',
  className = '',
  type = 'button',
  children,
  ...rest
}: AeroButtonProps) => (
  <button type={type} className={`${BASE} ${TONES[tone]} ${className}`} {...rest}>
    {/* top gloss band — the Aero highlight, dimmed while pressed */}
    {tone !== 'quiet' && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[4px] bg-linear-to-b from-white/22 to-transparent transition-opacity duration-150 group-active:opacity-40"
      />
    )}
    <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]">{children}</span>
  </button>
);
