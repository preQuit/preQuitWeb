import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Nothing in this app renders next/image, but /_next/image is served regardless
  // and this Next version carries a critical RCE in that endpoint's SVG handling.
  // Disabling optimization removes the route's reachable surface at zero cost.
  images: { unoptimized: true },
  // Without this the dev server refuses the HMR/runtime handshake for any origin
  // that is not localhost, the client never hydrates, and server-rendered state
  // (such as a hidden splash nav) stays frozen on screen.
  allowedDevOrigins: ['10.205.65.102', '127.0.0.1', 'localhost'],
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
