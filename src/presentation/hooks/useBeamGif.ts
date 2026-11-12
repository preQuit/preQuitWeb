'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { giphyConfig } from '../../data/config/giphyConfig';
import {
  fetchRandomGif,
  poolIsSpent,
  preloadGif,
  readPool,
  writePool,
  type BeamGif,
  type BeamGifPool,
} from '../../data/media/giphyBeamGifs';

// A re-hover inside this window keeps the gif that was already on screen, so
// flicking the cursor across the headline does not strobe through the day's set.
const HOLD_MS = 3000;

// The beam is a cursor effect on the wide layout. Anywhere the headline is not
// actually on a pointer-driven screen, Giphy is never called at all.
const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

export interface BeamGifState {
  readonly url: string | null;
  readonly onReveal: () => void;
}

export const useBeamGif = (target: RefObject<HTMLElement | null>): BeamGifState => {
  const [url, setUrl] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const pool = useRef<BeamGifPool | null>(null);
  const lastReveal = useRef(0);
  const topping = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia(DESKTOP_QUERY);
    let observer: IntersectionObserver | null = null;

    const watch = () => {
      observer?.disconnect();
      observer = null;

      const node = target.current;
      if (!media.matches || !node) {
        setArmed(false);
        return;
      }

      observer = new IntersectionObserver(
        entries => setArmed(entries.some(entry => entry.isIntersecting)),
        { threshold: 0.2 },
      );
      observer.observe(node);
    };

    watch();
    media.addEventListener('change', watch);

    return () => {
      media.removeEventListener('change', watch);
      observer?.disconnect();
    };
  }, [target]);

  const topUp = useCallback(async () => {
    if (topping.current || !giphyConfig.apiKey) return;

    const current = pool.current ?? readPool();
    if (!current || poolIsSpent(current)) {
      pool.current = current;
      return;
    }

    topping.current = true;
    try {
      let working = current;
      while (!poolIsSpent(working)) {
        const gif = await fetchRandomGif();
        const spent: BeamGifPool = { ...working, calls: working.calls + 1 };
        const gifs: readonly BeamGif[] =
          gif && !spent.gifs.some(entry => entry.id === gif.id)
            ? [...spent.gifs, gif]
            : spent.gifs;

        working = { ...spent, gifs };
        pool.current = working;
        writePool(working);
        if (gif) preloadGif(gif.url);
        if (!gif) break;
      }
    } finally {
      topping.current = false;
    }
  }, []);

  useEffect(() => {
    if (!armed) return;
    const stored = readPool();
    pool.current = stored;
    stored?.gifs.forEach(gif => preloadGif(gif.url));
    void topUp();
  }, [armed, topUp]);

  const onReveal = useCallback(() => {
    if (!armed) return;

    const now = Date.now();
    const held = now - lastReveal.current < HOLD_MS;
    lastReveal.current = now;

    const gifs = pool.current?.gifs ?? [];
    if (!held || !url) {
      const candidates = gifs.filter(gif => gif.url !== url);
      const next = candidates.length > 0 ? candidates : gifs;
      if (next.length > 0) setUrl(next[Math.floor(Math.random() * next.length)].url);
    }

    void topUp();
  }, [armed, topUp, url]);

  return { url, onReveal };
};
