export const ROUTES = {
  SPLASH: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  RESET_PASSWORD: '/reset-password',
  HOME: '/home',
  SOCIAL: '/social',
  CHATS: '/chats',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const conversationRoute = (conversationId: string): string =>
  `${ROUTES.CHATS}/${conversationId}`;
