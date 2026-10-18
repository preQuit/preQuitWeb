/**
 * Frutiger Aero sky, black edition.
 *
 * The era's wallpapers were a deep gradient, a horizon bloom, light shafts and
 * glossy bubbles — all in azure/teal, never violet. Everything here is CSS so it
 * stays crisp at any size and costs nothing to paint.
 */

interface Bloom {
  readonly className: string;
}

const BLOOMS: readonly Bloom[] = [
  // horizon glow, bottom centre — the Aero "light under the glass"
  { className: 'bottom-[-30vh] left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(47,155,255,0.30),transparent_65%)]' },
  // cool teal wash, upper right
  { className: 'right-[-18vw] top-[-14vh] h-[66vh] w-[66vw] bg-[radial-gradient(circle_at_center,rgba(31,227,194,0.16),transparent_62%)] animate-aurora' },
  // azure wash, left
  { className: 'left-[-22vw] top-[12vh] h-[62vh] w-[62vw] bg-[radial-gradient(circle_at_center,rgba(88,215,255,0.17),transparent_62%)] [animation-delay:-8s] animate-aurora' },
];

// Glossy bubbles. Each is a sphere: dark rim, cyan body, specular hotspot.
const BUBBLES: readonly string[] = [
  'left-[8%] top-[62%] size-28 [animation-delay:-2s]',
  'left-[22%] top-[26%] size-16 [animation-delay:-9s]',
  'right-[12%] top-[52%] size-36 [animation-delay:-5s]',
  'right-[26%] top-[16%] size-12 [animation-delay:-14s]',
  'left-[46%] bottom-[8%] size-20 [animation-delay:-11s]',
];

export const AmbientBackdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
    {/* base vertical gradient: black into a deep sea-blue floor */}
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000000_0%,#02060c_42%,#04121f_74%,#06202f_100%)]" />

    {BLOOMS.map(bloom => (
      <div key={bloom.className} className={`absolute blur-[90px] ${bloom.className}`} />
    ))}

    {/* light shaft raking from the top left */}
    <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(146,225,255,0.10)_0%,transparent_38%)]" />

    {BUBBLES.map(bubble => (
      <div
        key={bubble}
        className={`absolute rounded-full animate-drift ${bubble}`}
        style={{
          background:
            'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.75) 0%, rgba(170,235,255,0.26) 14%, rgba(40,140,200,0.13) 46%, rgba(6,28,44,0.06) 72%)',
          boxShadow:
            'inset 0 -6px 14px -6px rgba(120,220,255,0.5), inset 0 4px 10px -4px rgba(255,255,255,0.45), 0 0 26px -6px rgba(88,215,255,0.28)',
          border: '1px solid rgba(160,230,255,0.16)',
        }}
      />
    ))}

    {/* top specular sheet, keeps the very top of the page glassy */}
    <div className="absolute inset-x-0 top-0 h-[38vh] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.055),transparent)]" />

    {/* fine scanline/noise veil so the gradients do not band */}
    <div className="absolute inset-0 opacity-[0.045] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.9)_0px,rgba(255,255,255,0.9)_1px,transparent_1px,transparent_3px)]" />
  </div>
);
