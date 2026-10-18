'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonTone = 'solid' | 'glass' | 'outline';

const TONES: Readonly<Record<ButtonTone, string>> = {
  solid: 'bg-paper text-ink hover:bg-white/90',
  glass: 'glass text-paper hover:border-glass-edge hover:bg-white/10',
  outline: 'border border-paper/80 text-paper hover:bg-white/10',
};

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
    className={`flex h-13 items-center justify-center px-5 text-base font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${TONES[tone]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
