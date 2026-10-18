import type { ReactNode } from 'react';

export interface SectionLabelProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export const SectionLabel = ({ children, className = '' }: SectionLabelProps) => (
  <p className={`text-[11px] font-semibold tracking-[0.12em] text-muted uppercase ${className}`}>
    {children}
  </p>
);
