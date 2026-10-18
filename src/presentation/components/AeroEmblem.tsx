'use client';

import { useId } from 'react';

/**
 * PreQuit's octagon mark rendered as a chromed Aero solid — the "eye of
 * internet" motif from the splash, given the beveled metal-and-glass treatment
 * that early Aero product art used. Pure SVG so it stays sharp at any size.
 */

export interface AeroEmblemProps {
  readonly size?: number;
  readonly className?: string;
}

const octagon = (r: number): string =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');

// The geometry never changes, so the three rings are computed once.
const BEZEL = octagon(84);
const INNER = octagon(70);
const EYE = octagon(62);

export const AeroEmblem = ({ size = 150, className = '' }: AeroEmblemProps) => {
  // DOM ids are global: without scoping, a second instance on the page would
  // redefine these gradient ids and both marks would resolve to one of them.
  const uid = useId();
  const ref = (name: string): string => `url(#${uid}-${name})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      role="img"
      aria-label="PreQuit"
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-chrome`} x1="0" y1="-1" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#eaf6ff" />
          <stop offset="26%" stopColor="#9fc2d6" />
          <stop offset="48%" stopColor="#3f5666" />
          <stop offset="52%" stopColor="#223240" />
          <stop offset="78%" stopColor="#7fa6bd" />
          <stop offset="100%" stopColor="#d8ecf8" />
        </linearGradient>

        <radialGradient id={`${uid}-eye`} cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#bdf0ff" />
          <stop offset="34%" stopColor="rgb(var(--aero-cyan-rgb))" />
          <stop offset="72%" stopColor="rgb(var(--aero-azure-rgb))" />
          <stop offset="100%" stopColor="#06243c" />
        </radialGradient>

        <linearGradient id={`${uid}-gloss`} x1="0" y1="-1" x2="0.2" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id={`${uid}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id={`${uid}-clip`}>
          <polygon points={EYE} />
        </clipPath>
      </defs>

      {/* outer azure bloom */}
      <polygon points={BEZEL} fill="rgb(var(--aero-cyan-rgb))" opacity="0.16" filter={ref('bloom')} />

      {/* chromed octagonal bezel */}
      <polygon points={BEZEL} fill={ref('chrome')} />
      <polygon points={INNER} fill="#06111b" />

      {/* the eye */}
      <polygon points={EYE} fill={ref('eye')} />

      {/* pupil */}
      <g clipPath={ref('clip')}>
        <ellipse cx="0" cy="4" rx="21" ry="29" fill="#03151f" />
        <ellipse cx="0" cy="4" rx="21" ry="29" fill="none" stroke="#9fe8ff" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="-9" cy="-10" r="7" fill="#ffffff" opacity="0.92" />
        <circle cx="7" cy="16" r="3.4" fill="#bdf0ff" opacity="0.6" />
      </g>

      {/* specular sheet over the top half */}
      <g clipPath={ref('clip')}>
        <ellipse cx="-8" cy="-46" rx="56" ry="34" fill={ref('gloss')} />
      </g>

      {/* bezel edge highlights */}
      <polygon points={BEZEL} fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.2" />
      <polygon points={INNER} fill="none" stroke="#000000" strokeOpacity="0.75" strokeWidth="1.6" />
    </svg>
  );
};
