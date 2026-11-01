import { apiConfig } from '../config/apiConfig';
import { BrowserSessionRepository } from '../storage/BrowserSessionRepository';
import type { InteractionEventType, TelemetryBatchResult, TelemetryEventInput } from './TelemetryTypes';

const FLUSH_INTERVAL_MS = 4_000;
const MAX_QUEUE_SIZE_BEFORE_EAGER_FLUSH = 20;
const MAX_BATCH_SIZE = 200;

const randomBatchId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export interface TelemetryClientOptions {
  readonly baseUrl?: string;
  readonly session?: BrowserSessionRepository;
  readonly flushIntervalMs?: number;
}

/**
 * Batches impression/dwell/skip telemetry client-side so a scroll producing
 * dozens of events per second costs one request every few seconds, not one
 * request per event. Flushes on a timer, on an eager size threshold, and on
 * page hide/unload via sendBeacon.
 */
export class TelemetryClient {
  private readonly baseUrl: string;
  private readonly session: BrowserSessionRepository;
  private readonly flushIntervalMs: number;
  private queue: TelemetryEventInput[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly sentImpressions = new Set<string>();

  constructor(options: TelemetryClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? apiConfig.baseUrl;
    this.session = options.session ?? new BrowserSessionRepository();
    this.flushIntervalMs = options.flushIntervalMs ?? FLUSH_INTERVAL_MS;
    this.attachLifecycleListeners();
  }

  trackImpression(postId: string, surface?: string | null): void {
    const key = `impression:${postId}`;
    if (this.sentImpressions.has(key)) return;
    this.sentImpressions.add(key);
    this.enqueue({ postId, type: 'impression', surface });
  }

  trackDwell(postId: string, dwellMs: number, surface?: string | null): void {
    if (dwellMs <= 0) return;
    this.enqueue({ postId, type: 'dwell', dwellMs, surface });
  }

  trackSkip(postId: string, surface?: string | null): void {
    this.enqueue({ postId, type: 'skip', surface });
  }

  trackTapThrough(postId: string, surface?: string | null): void {
    this.enqueue({ postId, type: 'tap_through', surface });
  }

  trackProfileVisit(postId: string, surface?: string | null): void {
    this.enqueue({ postId, type: 'profile_visit', surface });
  }

  async hidePost(postId: string): Promise<boolean> {
    return this.postAction(`/posts/${postId}/hide`);
  }

  async markNotInterested(postId: string): Promise<boolean> {
    return this.postAction(`/posts/${postId}/not-interested`);
  }

  flush(useBeacon = false): void {
    if (this.queue.length === 0) return;
    const events = this.queue.splice(0, MAX_BATCH_SIZE);
    const payload = {
      clientBatchId: randomBatchId(),
      events,
      ...(useBeacon ? { accessToken: this.session.accessToken() ?? undefined } : {}),
    };

    if (useBeacon && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(`${this.baseUrl}/telemetry/events`, blob);
      return;
    }

    void this.send(payload);
  }

  private enqueue(event: TelemetryEventInput): void {
    this.queue.push(event);
    this.ensureTimer();
    if (this.queue.length >= MAX_QUEUE_SIZE_BEFORE_EAGER_FLUSH) this.flush(false);
  }

  private ensureTimer(): void {
    if (this.timer || typeof window === 'undefined') return;
    this.timer = setInterval(() => this.flush(false), this.flushIntervalMs);
  }

  private async send(payload: {
    clientBatchId: string;
    events: TelemetryEventInput[];
    accessToken?: string;
  }): Promise<TelemetryBatchResult | null> {
    const token = this.session.accessToken();
    if (!token) return null;
    try {
      const response = await fetch(`${this.baseUrl}/telemetry/events`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as { data?: TelemetryBatchResult };
      return body.data ?? null;
    } catch {
      // Telemetry is best-effort: a dropped batch must never surface to the UI.
      return null;
    }
  }

  private async postAction(path: string): Promise<boolean> {
    const token = this.session.accessToken();
    if (!token) return false;
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private attachLifecycleListeners(): void {
    if (typeof window === 'undefined') return;
    const flushOnHide = (): void => this.flush(true);
    window.addEventListener('pagehide', flushOnHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushOnHide();
    });
  }
}

let singleton: TelemetryClient | null = null;

export const getTelemetryClient = (): TelemetryClient => {
  if (!singleton) singleton = new TelemetryClient();
  return singleton;
};

export type { InteractionEventType, TelemetryBatchResult, TelemetryEventInput };
