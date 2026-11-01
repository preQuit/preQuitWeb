export const ROUTES = {
  SPLASH: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  RESET_PASSWORD: '/reset-password',
  FEED: '/feed',
  SEARCH: '/search',
  CHATS: '/chats',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const conversationRoute = (conversationId: string): string =>
  `${ROUTES.CHATS}/${conversationId}`;
