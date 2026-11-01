'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { ControlSize } from './controlSize';

/**
 * The one button in the app. Flat and square-cornered, like the mobile app:
 * a solid block of colour with no gradient, bevel or gloss. Call sites pick a
 * tone — they never restyle.
 */
export type ButtonTone = 'primary' | 'secondary' | 'outline' | 'quiet';

const TONES: Readonly<Record<ButtonTone, string>> = {
  // Acid lime is the 10% of the palette, so `primary` is the only tone that
  // may fill with it. Its label is ink, not paper: lime this saturated
  // measures 1.05:1 against white.
  primary: 'btn btn-primary hover:btn-primary-hover text-ink',
  secondary: 'btn hover:btn-hover text-paper',
  outline:
    'rounded-control border border-line bg-transparent text-paper hover:border-cobalt hover:bg-cobalt/12',
  quiet: 'rounded-control border border-transparent text-muted hover:bg-cobalt/12 hover:text-paper',
};

const SIZES: Readonly<Record<ControlSize, string>> = {
  action: 'h-action px-6 text-action',
  control: 'h-control px-5 text-control',
};

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly tone?: ButtonTone;
  readonly size?: ControlSize;
  readonly children: ReactNode;
}

export const GlassButton = ({
  tone = 'secondary',
  size = 'action',
  className = '',
  type = 'button',
  children,
  ...rest
}: GlassButtonProps) => (
  <button
    type={type}
    className={`inline-flex select-none items-center justify-center gap-2 font-bold transition-opacity active:opacity-80 disabled:pointer-events-none disabled:opacity-60 ${SIZES[size]} ${TONES[tone]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
