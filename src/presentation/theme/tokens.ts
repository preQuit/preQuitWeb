/**
 * Geometry only. Colour lives in app/globals.css @theme and is referenced here
 * through CSS custom properties, so there is exactly one place to change a hue.
 */

export const SOLAR = {
  sunSize: 120,
  rings: [190, 270, 350],
  dotSize: 16,
} as const;

export interface Orbit {
  readonly id: string;
  /** A CSS colour reference, resolved from the @theme token at paint time. */
  readonly color: string;
  readonly ring: number;
  readonly durationMs: number;
  readonly clockwise: boolean;
}

export const ORBITS: readonly Orbit[] = [
  { id: 'red', color: 'var(--color-orbit-red)', ring: SOLAR.rings[0], durationMs: 4000, clockwise: true },
  { id: 'violet', color: 'var(--color-orbit-violet)', ring: SOLAR.rings[1], durationMs: 6500, clockwise: false },
  { id: 'blue', color: 'var(--color-orbit-blue)', ring: SOLAR.rings[2], durationMs: 9000, clockwise: true },
];
