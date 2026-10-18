const LAYERS = [
  'left-[-18vw] top-[-12vh] h-[62vh] w-[62vw] bg-orbit-violet/22 [animation-delay:0ms]',
  'right-[-22vw] top-[18vh] h-[58vh] w-[58vw] bg-orbit-blue/18 [animation-delay:-6s]',
  'bottom-[-24vh] left-[12vw] h-[54vh] w-[54vw] bg-orbit-red/14 [animation-delay:-12s]',
] as const;

export const AmbientBackdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
    {LAYERS.map(layer => (
      <div
        key={layer}
        className={`absolute rounded-full blur-[120px] animate-aurora ${layer}`}
      />
    ))}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.07),transparent_60%)]" />
  </div>
);
