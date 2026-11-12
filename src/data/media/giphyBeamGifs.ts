import { giphyConfig } from '../config/giphyConfig';
import { deviceId, todayKey } from '../storage/deviceIdentity';

const CACHE_KEY = '@prequit/beamGifs';
const RANDOM_ENDPOINT = 'https://api.giphy.com/v1/gifs/random';

export interface BeamGif {
  readonly id: string;
  readonly url: string;
}

// `calls` counts requests, not results: a duplicate or a failed fetch still
// spends the day's allowance, so a bad streak can never loop on the network.
export interface BeamGifPool {
  readonly device: string;
  readonly day: string;
  readonly calls: number;
  readonly gifs: readonly BeamGif[];
}

interface GiphyRandomResponse {
  readonly data?: {
    readonly id?: string;
    readonly images?: {
      readonly downsized_medium?: { readonly url?: string };
      readonly original?: { readonly url?: string };
    };
  };
}

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isGif = (entry: unknown): entry is BeamGif =>
  typeof entry === 'object' &&
  entry !== null &&
  typeof (entry as BeamGif).id === 'string' &&
  typeof (entry as BeamGif).url === 'string';

const emptyPool = (device: string): BeamGifPool => ({
  device,
  day: todayKey(),
  calls: 0,
  gifs: [],
});

export const readPool = (): BeamGifPool | null => {
  const device = deviceId();
  if (!device) return null;

  try {
    const raw = storage()?.getItem(CACHE_KEY);
    if (!raw) return emptyPool(device);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return emptyPool(device);

    const pool = parsed as Partial<BeamGifPool>;
    // A new day, or a different device profile, starts a fresh allowance —
    // which is what rotates everyone onto a different set each morning.
    if (pool.device !== device || pool.day !== todayKey()) return emptyPool(device);

    return {
      device,
      day: todayKey(),
      calls: typeof pool.calls === 'number' ? pool.calls : 0,
      gifs: Array.isArray(pool.gifs) ? pool.gifs.filter(isGif) : [],
    };
  } catch {
    return emptyPool(device);
  }
};

export const writePool = (pool: BeamGifPool): void => {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(CACHE_KEY, JSON.stringify(pool));
  } catch {
    return;
  }
};

export const poolIsSpent = (pool: BeamGifPool): boolean =>
  pool.calls >= giphyConfig.dailyLimit || pool.gifs.length >= giphyConfig.dailyLimit;

const pickTag = (): string =>
  giphyConfig.tags[Math.floor(Math.random() * giphyConfig.tags.length)];

export const fetchRandomGif = async (signal?: AbortSignal): Promise<BeamGif | null> => {
  if (!giphyConfig.apiKey) return null;

  const params = new URLSearchParams({
    api_key: giphyConfig.apiKey,
    rating: giphyConfig.rating,
    tag: pickTag(),
  });

  try {
    const response = await fetch(`${RANDOM_ENDPOINT}?${params.toString()}`, { signal });
    if (!response.ok) return null;
    const body: GiphyRandomResponse = await response.json();
    const url = body.data?.images?.downsized_medium?.url ?? body.data?.images?.original?.url;
    const id = body.data?.id;
    if (!url || !id) return null;
    return { id, url };
  } catch {
    return null;
  }
};

export const preloadGif = (url: string): void => {
  if (typeof window === 'undefined') return;
  const image = new window.Image();
  image.decoding = 'async';
  image.src = url;
};
