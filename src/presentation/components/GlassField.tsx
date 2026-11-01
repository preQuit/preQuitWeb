'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

import type { ControlSize } from './controlSize';

/**
 * The one text input in the app. Flat square well with a single hairline, at
 * the mobile app's 56px height; an optional label renders above it.
 */
const SIZES: Readonly<Record<ControlSize, string>> = {
  action: 'h-field gap-3 px-4 text-action',
  control: 'h-control gap-2 px-2.5 text-control',
};

export interface GlassFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly label?: string;
  readonly adornment?: ReactNode;
  readonly invalid?: boolean;
  readonly size?: ControlSize;
}

export const GlassField = ({
  label,
  adornment,
  invalid = false,
  size = 'action',
  className = '',
  id,
  ...rest
}: GlassFieldProps) => {
  const control = (
    <div
      className={`field flex items-center focus-within:field-focus ${SIZES[size]} ${
        invalid ? 'field-invalid' : ''
      } ${rest.disabled ? 'opacity-50' : ''}`}
    >
      <input
        id={id}
        className={`min-w-0 flex-1 bg-transparent text-paper outline-none disabled:cursor-not-allowed ${className}`}
        {...rest}
      />
      {adornment}
    </div>
  );

  if (!label) return control;

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-control font-bold tracking-wide text-muted uppercase">{label}</span>
      {control}
    </label>
  );
};
