/**
 * Frutiger Aero sky, black edition.
 *
 * The era's wallpapers were a deep gradient, a horizon bloom, light shafts and
 * glossy bubbles — all in azure/teal, never violet. Everything here is CSS so it
 * stays crisp at any size and costs nothing to paint.
 */

interface Layer {
  readonly id: string;
  readonly className: string;
}

const BLOOMS: readonly Layer[] = [
  // horizon glow, bottom centre — the Aero "light under the glass"
  { id: 'horizon', className: 'bottom-[-30vh] left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgb(var(--aero-azure-rgb)/0.30),transparent_65%)]' },
  // cool teal wash, upper right
  { id: 'teal', className: 'right-[-18vw] top-[-14vh] h-[66vh] w-[66vw] bg-[radial-gradient(circle_at_center,rgb(var(--aero-teal-rgb)/0.16),transparent_62%)] animate-aurora' },
  // azure wash, left
  { id: 'azure', className: 'left-[-22vw] top-[12vh] h-[62vh] w-[62vw] bg-[radial-gradient(circle_at_center,rgb(var(--aero-cyan-rgb)/0.17),transparent_62%)] [animation-delay:-8s] animate-aurora' },
];

// Glossy bubbles. Each is a sphere: dark rim, cyan body, specular hotspot.
const BUBBLES: readonly Layer[] = [
  { id: 'b1', className: 'left-[8%] top-[62%] size-28 [animation-delay:-2s]' },
  { id: 'b2', className: 'left-[22%] top-[26%] size-16 [animation-delay:-9s]' },
  { id: 'b3', className: 'right-[12%] top-[52%] size-36 [animation-delay:-5s]' },
  { id: 'b4', className: 'right-[26%] top-[16%] size-12 [animation-delay:-14s]' },
  { id: 'b5', className: 'left-[46%] bottom-[8%] size-20 [animation-delay:-11s]' },
];

export const AmbientBackdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
    {/* base vertical gradient: black into a deep sea-blue floor */}
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000000_0%,#02060c_42%,#04121f_74%,#06202f_100%)]" />

    {BLOOMS.map(bloom => (
      <div key={bloom.id} className={`absolute blur-[90px] ${bloom.className}`} />
    ))}

    {/* light shaft raking from the top left */}
    <div className="absolute inset-0 bg-[linear-gradient(105deg,rgb(var(--aero-sky-rgb)/0.10)_0%,transparent_38%)]" />

    {BUBBLES.map(bubble => (
      <div
        key={bubble.id}
        className={`aero-bubble absolute rounded-full animate-drift ${bubble.className}`}
      />
    ))}

    {/* top specular sheet, keeps the very top of the page glassy */}
    <div className="absolute inset-x-0 top-0 h-[38vh] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.055),transparent)]" />

    {/* fine scanline/noise veil so the gradients do not band */}
    <div className="absolute inset-0 opacity-[0.045] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.9)_0px,rgba(255,255,255,0.9)_1px,transparent_1px,transparent_3px)]" />
  </div>
);
