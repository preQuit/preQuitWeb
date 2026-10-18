'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { ControlSize } from './controlSize';

/**
 * The one button in the app. Aero tones are raised and glossy; `quiet` is the
 * flat toolbar affordance. Call sites pick a tone — they never restyle.
 */
export type ButtonTone = 'primary' | 'secondary' | 'outline' | 'quiet';

interface ToneSpec {
  readonly classes: string;
  /** Glossy tones get the specular band; flat ones must not. */
  readonly glossy: boolean;
}

const TONES: Readonly<Record<ButtonTone, ToneSpec>> = {
  primary: { classes: 'aero-button aero-button-primary hover:aero-button-hover', glossy: true },
  secondary: { classes: 'aero-button hover:aero-button-hover', glossy: true },
  outline: {
    classes: 'rounded-control border border-glass-line bg-white/4 hover:aero-button-hover hover:border-glass-edge',
    glossy: false,
  },
  quiet: {
    classes: 'rounded-control border border-transparent text-muted hover:bg-white/6 hover:text-paper',
    glossy: false,
  },
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
}: GlassButtonProps) => {
  const spec = TONES[tone];

  return (
    <button
      type={type}
      className={`group relative inline-flex select-none items-center justify-center gap-2 font-semibold text-paper disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50 ${SIZES[size]} ${spec.classes} ${className}`}
      {...rest}
    >
      {spec.glossy && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-control bg-linear-to-b from-white/22 to-transparent transition-opacity duration-150 group-active:opacity-40"
        />
      )}
      <span className="relative inline-flex items-center gap-2 aero-text-shadow">{children}</span>
    </button>
  );
};
