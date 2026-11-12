'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface NavGlyphProps {
  /** Animated asset path, usually from NAV_ICONS. */
  readonly animated?: string;
  /** Line icon drawn when there is no animated asset, or it fails to load. */
  readonly fallback: LucideIcon;
  readonly active?: boolean;
}

/**
 * One menu glyph tile.
 *
 * The line icon is the contract and the animated asset is an enhancement on
 * top of it: a row whose GIF 404s or is blocked still has to be identifiable,
 * so a load failure quietly swaps back instead of leaving an empty tile.
 *
 * The tile keeps the app's own palette — the assets bring their own colour,
 * so tinting the container as well would make every row fight for attention.
 */
export const NavGlyph = ({ animated, fallback: Fallback, active = false }: NavGlyphProps) => {
  const [failed, setFailed] = useState(false);
  const showAnimated = Boolean(animated) && !failed;

  return (
    <span
      className={`surface-subtle flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors ${
        active ? 'ring-1 ring-cobalt/70' : ''
      }`}
    >
      {showAnimated ? (
        <img
          src={animated}
          alt=""
          aria-hidden
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-8 object-contain"
        />
      ) : (
        <Fallback size={18} strokeWidth={1.9} className="text-paper" />
      )}
    </span>
  );
};
