import { ORBITS, SOLAR } from '../theme/tokens';

const outerRing = SOLAR.rings[SOLAR.rings.length - 1];

export const SolarSystem = () => (
  <div
    aria-hidden
    className="relative flex shrink-0 items-center justify-center"
    style={{ width: outerRing, height: outerRing }}
  >
    {SOLAR.rings.map(ring => (
      <span
        key={ring}
        className="absolute rounded-full border border-white/14"
        style={{ width: ring, height: ring }}
      />
    ))}

    {ORBITS.map(orbit => (
      <span
        key={orbit.color}
        className="absolute flex justify-center"
        style={{
          width: orbit.ring,
          height: orbit.ring,
          animation: `orbit-spin ${orbit.durationMs}ms linear infinite${orbit.clockwise ? '' : ' reverse'}`,
        }}
      >
        <span
          className="rounded-full"
          style={{
            width: SOLAR.dotSize,
            height: SOLAR.dotSize,
            marginTop: -SOLAR.dotSize / 2,
            backgroundColor: orbit.color,
            boxShadow: `0 0 18px 2px ${orbit.color}`,
          }}
        />
      </span>
    ))}

    <span
      className="glass-raised flex animate-pulse-sun items-center justify-center rounded-full"
      style={{
        width: SOLAR.sunSize,
        height: SOLAR.sunSize,
        boxShadow: '0 0 60px rgba(255,255,255,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <span className="display-title text-3xl text-paper">PQ</span>
    </span>
  </div>
);
