export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF3B30',
  violet: '#8A2BE2',
  blue: '#2E7DFF',
  like: '#FF375F',
  danger: '#FF453A',
  failure: '#FF6B6B',
} as const;

export const SOLAR = {
  sunSize: 120,
  rings: [190, 270, 350],
  dotSize: 16,
} as const;

export interface Orbit {
  readonly color: string;
  readonly ring: number;
  readonly durationMs: number;
  readonly clockwise: boolean;
}

export const ORBITS: readonly Orbit[] = [
  { color: COLORS.red, ring: SOLAR.rings[0], durationMs: 4000, clockwise: true },
  { color: COLORS.violet, ring: SOLAR.rings[1], durationMs: 6500, clockwise: false },
  { color: COLORS.blue, ring: SOLAR.rings[2], durationMs: 9000, clockwise: true },
];
