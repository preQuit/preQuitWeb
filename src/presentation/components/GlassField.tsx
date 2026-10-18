'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

export interface GlassFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly adornment?: ReactNode;
}

export const GlassField = ({ adornment, className = '', ...rest }: GlassFieldProps) => (
  <div className="glass-field flex h-14 items-center gap-3 px-4 transition-colors duration-200 focus-within:border-glass-edge">
    <input
      className={`min-w-0 flex-1 text-base text-paper outline-none ${className}`}
      {...rest}
    />
    {adornment}
  </div>
);
