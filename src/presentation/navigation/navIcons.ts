/**
 * Animated menu glyphs, served as static files from `public/icons/nav`.
 *
 * Collected in one map so swapping an asset is a single line here rather than
 * a hunt through every component that draws a menu row. Consumers reference
 * `NAV_ICONS.feed`, never the literal path.
 */
export const NAV_ICONS = {
  feed: '/icons/nav/feed.gif',
  search: '/icons/nav/search.gif',
  messages: '/icons/nav/messages.gif',
  profile: '/icons/nav/profile.gif',
  people: '/icons/nav/people.gif',
  friends: '/icons/nav/friends.gif',
  settings: '/icons/nav/settings.gif',
  email: '/icons/nav/email.gif',
  username: '/icons/nav/username.gif',
} as const;

export type NavIconName = keyof typeof NAV_ICONS;
