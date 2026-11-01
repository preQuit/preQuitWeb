'use client';

/**
 * PreQuit's octagon mark — the "eye of internet" motif from the splash.
 *
 * Flat by construction, matching the mobile app: solid fills, one hairline
 * ring, no chrome gradient, no bevel and no specular sheet. The iris is
 * cobalt and the lower catchlight is the mark's only lime, which is what
 * keeps the accent reading as deliberate rather than decorative.
 */

export interface EmblemProps {
  readonly size?: number;
  readonly className?: string;
}

const octagon = (r: number): string =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');

// The geometry never changes, so the rings are computed once.
const BEZEL = octagon(84);
const EYE = octagon(62);

export const Emblem = ({ size = 150, className = '' }: EmblemProps) => (
  <svg
    width={size}
    height={size}
    viewBox="-100 -100 200 200"
    role="img"
    aria-label="PreQuit"
    className={className}
  >
    <polygon points={BEZEL} fill="none" stroke="var(--color-line-strong)" strokeWidth="2" />
    <polygon points={EYE} fill="var(--color-cobalt)" />
    <ellipse cx="0" cy="2" rx="21" ry="29" fill="var(--color-ink)" />
    <circle cx="6" cy="14" r="4" fill="var(--color-lime)" />
  </svg>
);
