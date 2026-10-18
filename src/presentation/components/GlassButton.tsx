'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The one button in the app. Aero tones are raised and glossy; `quiet` is the
 * flat toolbar affordance. Call sites pick a tone — they never restyle.
 */
export type ButtonTone = 'solid' | 'primary' | 'glass' | 'secondary' | 'outline' | 'quiet';

const TONES: Readonly<Record<ButtonTone, string>> = {
  // `solid` and `glass` are the legacy names kept so existing call sites keep
  // working; they now resolve to the Aero primary and secondary treatments.
  solid: 'aero-button aero-button-primary hover:aero-button-hover',
  primary: 'aero-button aero-button-primary hover:aero-button-hover',
  glass: 'aero-button hover:aero-button-hover',
  secondary: 'aero-button hover:aero-button-hover',
  outline:
    'rounded-control border border-glass-line bg-white/4 hover:aero-button-hover hover:border-glass-edge',
  quiet: 'rounded-control border border-transparent text-muted hover:bg-white/6 hover:text-paper',
};

const GLOSSY: ReadonlySet<ButtonTone> = new Set<ButtonTone>([
  'solid',
  'primary',
  'glass',
  'secondary',
]);

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly tone?: ButtonTone;
  readonly children: ReactNode;
}

export const GlassButton = ({
  tone = 'glass',
  className = '',
  type = 'button',
  children,
  ...rest
}: GlassButtonProps) => (
  <button
    type={type}
    className={`group relative inline-flex h-control select-none items-center justify-center gap-2 px-5 text-control font-semibold text-paper disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50 ${TONES[tone]} ${className}`}
    {...rest}
  >
    {GLOSSY.has(tone) && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-control bg-linear-to-b from-white/22 to-transparent transition-opacity duration-150 group-active:opacity-40"
      />
    )}
    <span className="relative aero-text-shadow">{children}</span>
  </button>
);
