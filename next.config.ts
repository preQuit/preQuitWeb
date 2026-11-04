import type { NextConfig } from "next";

// Where the browser's /api and /socket.io calls get forwarded. Set this (not
// NEXT_PUBLIC_API_BASE_URL) when the app is reached through a tunnel: the
// frontend then talks to its own origin and one ngrok tunnel covers both the
// page and the API, with no CORS involved and nothing baked in at build time.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? '';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Nothing in this app renders next/image, but /_next/image is served regardless
  // and this Next version carries a critical RCE in that endpoint's SVG handling.
  // Disabling optimization removes the route's reachable surface at zero cost.
  images: { unoptimized: true },
  // Without this the dev server refuses the HMR/runtime handshake for any origin
  // that is not localhost, the client never hydrates, and server-rendered state
  // (such as a hidden splash nav) stays frozen on screen.
  allowedDevOrigins: [
    '10.205.65.102',
    '127.0.0.1',
    'localhost',
    '.ngrok-free.app',
    '.ngrok.app',
    '.ngrok.io',
    '.trycloudflare.com',
  ],
  // Socket.IO polls "/socket.io/?EIO=4..." with the trailing slash intact.
  // Next's default redirect strips it, turning every handshake into a 308 and
  // leaving the websocket upgrade on a redirected path.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (!API_PROXY_TARGET) return [];
    return [
      { source: '/api/:path*', destination: `${API_PROXY_TARGET}/api/:path*` },
      // Two entries, not one wildcard: ":path*" matches the bare handshake with
      // an empty segment and normalises the destination to "/socket.io", which
      // nginx's prefix location then 301s back to "/socket.io/".
      { source: '/socket.io/', destination: `${API_PROXY_TARGET}/socket.io/` },
      { source: '/socket.io/:path+', destination: `${API_PROXY_TARGET}/socket.io/:path+` },
    ];
  },
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
