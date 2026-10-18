const DEFAULT_ORIGIN = 'http://localhost:4000';
const DEFAULT_TIMEOUT_MS = 15000;

const origin = process.env.NEXT_PUBLIC_API_ORIGIN ?? DEFAULT_ORIGIN;

const timeoutFromEnv = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);

export interface ApiConfig {
  readonly baseUrl: string;
  readonly realtimeUrl: string;
  readonly requestTimeoutMs: number;
}

export const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? `${origin}/api/v1`,
  realtimeUrl: origin,
  requestTimeoutMs: Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0 ? timeoutFromEnv : DEFAULT_TIMEOUT_MS,
};
