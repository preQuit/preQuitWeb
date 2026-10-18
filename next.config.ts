import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
