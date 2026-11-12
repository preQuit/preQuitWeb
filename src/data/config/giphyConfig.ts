const DAILY_LIMIT = 10;

// `g` is the only Giphy rating that excludes suggestive and adult results, so
// it is not configurable — the beam renders on an unauthenticated page.
export interface GiphyConfig {
  readonly apiKey: string;
  readonly rating: 'g';
  readonly dailyLimit: number;
  readonly tags: readonly string[];
}

export const giphyConfig: GiphyConfig = {
  apiKey: process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? '',
  rating: 'g',
  dailyLimit: DAILY_LIMIT,
  tags: [
    'video game',
    'retro gaming',
    'speedrun',
    'technology',
    'cyberpunk',
    'coding',
    'nature',
    'ocean',
    'forest',
    'brainrot',
    'meme',
    'cartoon',
    'adventure time',
    'anime',
    'studio ghibli',
    'sakura',
  ],
};
