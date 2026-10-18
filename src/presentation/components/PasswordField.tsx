'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { GlassField, type GlassFieldProps } from './GlassField';

export type PasswordFieldProps = Omit<GlassFieldProps, 'type' | 'adornment'>;

export const PasswordField = (props: PasswordFieldProps) => {
  const [revealed, setRevealed] = useState(false);
  const Icon = revealed ? Eye : EyeOff;

  return (
    <GlassField
      type={revealed ? 'text' : 'password'}
      adornment={
        <button
          type="button"
          aria-label={revealed ? 'Hide password' : 'Show password'}
          onClick={() => setRevealed(current => !current)}
          className="text-muted transition-colors hover:text-paper"
        >
          <Icon size={19} />
        </button>
      }
      {...props}
    />
  );
};
