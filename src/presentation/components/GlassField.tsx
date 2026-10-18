'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * The one text input in the app. Sunken Aero well; an optional label renders
 * above it in the Win7 dialog style ("User Name:").
 */
export interface GlassFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly adornment?: ReactNode;
  readonly invalid?: boolean;
}

export const GlassField = ({
  label,
  adornment,
  invalid = false,
  className = '',
  id,
  ...rest
}: GlassFieldProps) => {
  const control = (
    <div
      className={`glass-field flex h-control items-center gap-2 px-2.5 focus-within:glass-field-focus ${
        invalid ? 'glass-field-invalid' : ''
      } ${rest.disabled ? 'opacity-45' : ''}`}
    >
      <input
        id={id}
        className={`min-w-0 flex-1 text-control text-paper outline-none disabled:cursor-not-allowed ${className}`}
        {...rest}
      />
      {adornment}
    </div>
  );

  if (!label) return control;

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-control font-semibold text-paper/90 aero-text-shadow">{label}</span>
      {control}
    </label>
  );
};
