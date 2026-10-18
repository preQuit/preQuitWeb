'use client';

import { useEffect, useRef } from 'react';

/**
 * Calls `onReach` when the returned sentinel scrolls into view. An observer
 * rather than a scroll listener, so it costs nothing while idle and fires once
 * per approach instead of on every frame.
 */
export const useInfiniteScroll = <T extends HTMLElement = HTMLDivElement>(
  onReach: () => void,
  enabled: boolean,
) => {
  const sentinel = useRef<T | null>(null);
  // Kept in a ref so re-creating the callback each render does not tear down
  // and rebuild the observer.
  const handler = useRef(onReach);
  handler.current = onReach;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) handler.current();
      },
      // Start fetching before the reader actually hits the end.
      { rootMargin: '600px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinel;
};
