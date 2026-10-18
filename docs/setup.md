# Setup

## Requirements

- Node 22.11 or newer
- A running PreQuit backend (default `http://localhost:4000`)

## Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app serves on `http://localhost:3000`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

## Environment

All variables are public by necessity — the browser performs every API call directly.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_ORIGIN` | `http://localhost:4000` | Backend origin, used to derive the other two defaults |
| `NEXT_PUBLIC_API_BASE_URL` | `${ORIGIN}/api/v1` | Versioned API root every request is relative to |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | `15000` | Per-request Axios timeout |

The backend must allow this origin in `HTTP_CORS_ORIGINS`, since the browser sends credentials-bearing
requests cross-origin:

```
HTTP_CORS_ORIGINS=http://localhost:3000
```

## Running the backend locally without external services

For local development against no database and no Cloudinary account:

```bash
PERSISTENCE_BACKEND=memory \
SEARCH_BACKEND=memory \
CLUSTER_ENABLED=false \
CLOUDINARY_CLOUD_NAME= CLOUDINARY_API_KEY= CLOUDINARY_API_SECRET= \
HTTP_CORS_ORIGINS=http://localhost:3000 \
npm run dev
```

In this mode the email sender logs to stdout, so the account-verification link appears in the API log.
Registration leaves an account in `pending_verification`, and the verified-only routes
(`/conversations`, posting, commenting) stay closed until that link is used.

## Session storage

Tokens live in `localStorage` under `@prequit/accessToken`, `@prequit/refreshToken` and
`@prequit/user`, matching the mobile app's AsyncStorage keys. This is readable by any script running
on the origin; moving to `HttpOnly` cookies would require the backend to set them, which it does not
do today.
