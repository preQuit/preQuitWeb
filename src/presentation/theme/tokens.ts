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

/** One lime dot to two cobalt keeps the mark on the palette's 10% share. */
export const ORBITS: readonly Orbit[] = [
  { id: 'lime', color: 'var(--color-orbit-lime)', ring: SOLAR.rings[0], durationMs: 4000, clockwise: true },
  { id: 'cobalt', color: 'var(--color-orbit-cobalt)', ring: SOLAR.rings[1], durationMs: 6500, clockwise: false },
  { id: 'pale', color: 'var(--color-orbit-pale)', ring: SOLAR.rings[2], durationMs: 9000, clockwise: true },
];
