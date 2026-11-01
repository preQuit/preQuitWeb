'use client';

import { useEffect, useRef } from 'react';
import { getTelemetryClient } from '../../data/telemetry/TelemetryClient';

const DEFAULT_VISIBILITY_THRESHOLD = 0.6;
const DEFAULT_MIN_DWELL_MS = 500;

export interface UseImpressionTrackingOptions {
  readonly surface?: string | null;
  readonly visibilityThreshold?: number;
  readonly minDwellMs?: number;
  readonly enabled?: boolean;
}

/**
 * Fires an impression once a card has been both sufficiently visible AND
 * visible for a minimum dwell — a bare IntersectionObserver trigger would
 * count a card that flashes past mid-scroll as a real view. Also accumulates
 * total dwell time across every visible span and reports it once the card
 * leaves the viewport for good, so the ranker gets a genuine engagement
 * signal rather than a single boolean.
 */
export const useImpressionTracking = <T extends HTMLElement = HTMLDivElement>(
  postId: string,
  options: UseImpressionTrackingOptions = {},
) => {
  const node = useRef<T | null>(null);
  const {
    surface = null,
    visibilityThreshold = DEFAULT_VISIBILITY_THRESHOLD,
    minDwellMs = DEFAULT_MIN_DWELL_MS,
    enabled = true,
  } = options;

  const optionsRef = useRef({ surface, visibilityThreshold, minDwellMs });
  optionsRef.current = { surface, visibilityThreshold, minDwellMs };

  useEffect(() => {
    const el = node.current;
    if (!el || !enabled || typeof IntersectionObserver === 'undefined') return;

    const telemetry = getTelemetryClient();
    let visibleSinceMs: number | null = null;
    let accumulatedDwellMs = 0;
    let impressionTimer: ReturnType<typeof setTimeout> | null = null;
    let impressionFired = false;

    const clearImpressionTimer = (): void => {
      if (impressionTimer) {
        clearTimeout(impressionTimer);
        impressionTimer = null;
      }
    };

    const onEnterViewport = (): void => {
      visibleSinceMs = performance.now();
      if (impressionFired) return;
      clearImpressionTimer();
      impressionTimer = setTimeout(() => {
        if (!impressionFired) {
          impressionFired = true;
          telemetry.trackImpression(postId, optionsRef.current.surface);
        }
      }, optionsRef.current.minDwellMs);
    };

    const onLeaveViewport = (): void => {
      clearImpressionTimer();
      if (visibleSinceMs !== null) {
        accumulatedDwellMs += performance.now() - visibleSinceMs;
        visibleSinceMs = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= optionsRef.current.visibilityThreshold) {
          onEnterViewport();
        } else {
          onLeaveViewport();
        }
      },
      { threshold: [0, visibilityThreshold] },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      onLeaveViewport();
      if (accumulatedDwellMs > 0) telemetry.trackDwell(postId, Math.round(accumulatedDwellMs), optionsRef.current.surface);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, enabled]);

  return node;
};
