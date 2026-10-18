'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

export interface AeroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly adornment?: ReactNode;
  readonly invalid?: boolean;
}

export const AeroInput = ({
  label,
  adornment,
  invalid = false,
  className = '',
  id,
  ...rest
}: AeroInputProps) => {
  const control = (
    <div
      className={`glass-field flex h-8.5 items-center gap-2 px-2.5 focus-within:glass-field-focus ${
        invalid ? 'border-danger/70 shadow-[0_0_0_1px_rgba(255,69,58,0.45)]' : ''
      } ${rest.disabled ? 'opacity-45' : ''}`}
    >
      <input
        id={id}
        className={`min-w-0 flex-1 text-[13px] text-paper outline-none disabled:cursor-not-allowed ${className}`}
        {...rest}
      />
      {adornment}
    </div>
  );

  if (!label) return control;

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-paper/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
        {label}
      </span>
      {control}
    </label>
  );
};
