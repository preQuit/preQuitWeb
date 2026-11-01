/**
 * Path builders for the social-graph feature. Kept out of routes.ts (owned by
 * another phase of this build) so this phase never has to touch a file it
 * does not own just to add a route.
 */
export const SOCIAL_GRAPH_ROUTES = {
  root: '/social-graph',
  discover: '/social-graph/discover',
  friends: '/social-graph/friends',
  requests: '/social-graph/requests',
  blocked: '/social-graph/blocked',
  editProfile: '/social-graph/edit-profile',
  user: (handle: string) => `/social-graph/u/${encodeURIComponent(handle)}`,
  followers: (handle: string) => `/social-graph/u/${encodeURIComponent(handle)}/followers`,
  following: (handle: string) => `/social-graph/u/${encodeURIComponent(handle)}/following`,
} as const;
