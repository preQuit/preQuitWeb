'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

import type { ControlSize } from './controlSize';

/**
 * The one text input in the app. Sunken Aero well; an optional label renders
 * above it in the Win7 dialog style ("User Name:").
 */
const SIZES: Readonly<Record<ControlSize, string>> = {
  action: 'h-action gap-3 px-3.5 text-action',
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
      className={`glass-field flex items-center focus-within:glass-field-focus ${SIZES[size]} ${
        invalid ? 'glass-field-invalid' : ''
      } ${rest.disabled ? 'opacity-45' : ''}`}
    >
      <input
        id={id}
        className={`min-w-0 flex-1 text-paper outline-none disabled:cursor-not-allowed ${className}`}
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
