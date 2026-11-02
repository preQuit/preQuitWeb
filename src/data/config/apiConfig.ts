const DEFAULT_ORIGIN = 'http://localhost:4000';
const DEFAULT_TIMEOUT_MS = 15000;

// An explicitly empty NEXT_PUBLIC_API_ORIGIN means "same origin as the page".
// Socket.IO reads '' that way too, which is what lets one tunnel serve the app
// and its API without either URL being baked in at build time.
const configuredOrigin = process.env.NEXT_PUBLIC_API_ORIGIN;
const origin = configuredOrigin === undefined ? DEFAULT_ORIGIN : configuredOrigin;

const timeoutFromEnv = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);

// The gateway attaches to the same HTTP server Fastify listens on (src/main/api.ts),
// so the realtime endpoint is the API origin by default. NEXT_PUBLIC_REALTIME_URL only
// needs to be set when the socket must reach a different host than the REST API does.
const realtimeOverride = process.env.NEXT_PUBLIC_REALTIME_URL;

export interface ApiConfig {
  readonly baseUrl: string;
  readonly realtimeUrl: string;
  readonly requestTimeoutMs: number;
}

export const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || `${origin}/api/v1`,
  realtimeUrl: realtimeOverride && realtimeOverride.length > 0 ? realtimeOverride : origin,
  requestTimeoutMs: Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0 ? timeoutFromEnv : DEFAULT_TIMEOUT_MS,
};
