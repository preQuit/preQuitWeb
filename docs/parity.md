# Parity with the mobile app

## Screens

| Mobile screen | Web route | Screen component | Notes |
| --- | --- | --- | --- |
| `splash` | `/` | `SplashScreen` | Rings, orbiting dots, pulsing core, the same two actions. The logo bitmap is replaced by a glass core marked `PQ`, since the web project has no copy of `assets/logo.png`. |
| `auth/signin` | `/sign-in` | `SignInScreen` | Same fields, copy, reveal toggle and forgot-password link. |
| `auth/signup` | `/sign-up` | `SignUpScreen` | Same six fields. The native date picker becomes `<input type="date">`. |
| `auth/resetpassword` | `/reset-password` | `ResetPasswordScreen` | The mobile screen is an unimplemented placeholder; the web version is wired to `POST /auth/password/forgot`, which the mobile data layer already exposed but never called. |
| `auth/onBoard` | — | — | Placeholder on mobile (renders the word "OnBoard"). Not ported. |
| `dashboard/search` (tab Home) | `/home` | `HomeScreen` | Centred wordmark, search field, trending or matched topics, matched posts. |
| `dashboard/feed` (tab Social) | `/social` | `SocialScreen` | For You / Explore / Trending switcher, post cards, comment sheet. Pull-to-refresh becomes a header refresh button. |
| `friends/friends` (tab Friends) | `/chats` | `ChatsScreen` | Conversation list with local name filter. |
| `friends/dm` | `/chats/[conversationId]` | `DirectMessageScreen` | Bubbles, delivery status, composer. |
| `profile/personal` (tab Profile) | `/profile` | `ProfileScreen` | Avatar, identity, stat row, actions. The web screen additionally renders top topics and the viewer's own posts, using `LoadUserPostsUseCase` — present in the mobile container but never called by a mobile screen. |
| `profile/settings` | `/settings` | `SettingsScreen` | Account rows and sign out. |
| `friends/request` | — | — | Hard-coded mock data on mobile, not reachable from its navigator. Not ported. |

## Carried over unchanged

Entities and their factories, `AppError` and its classification, every repository port, and the use
case set. A use case file is line-for-line the mobile one where the logic did not depend on React
Native.

## Deliberate differences

**Server state.** The mobile app uses a hand-rolled `useAsyncResource` with local `useState`
mirrors. The web app uses TanStack Query, as requested: the query cache replaces the mirrors, so
optimistic like/save edits and the pending/sent/failed message lifecycle are expressed as cache
writes and rollbacks instead of parallel state.

**Transport.** `fetch` becomes Axios with interceptors. The single-flight refresh-on-401 behaviour is
preserved exactly; the retry is now a replayed request config rather than a recursive call.

**Storage.** AsyncStorage becomes `localStorage`, under the same keys. Reads are guarded, so SSR and
browsers with site data blocked degrade to a signed-out session instead of throwing.

**Seed fallback removed.** The mobile container wraps each repository in `withSeedFallback`, which
substitutes bundled fixture data when the network fails. The web client surfaces the real error
instead — a browser app that silently shows fabricated posts when the API is unreachable is worse
than one that says it could not load. `AppError.isOffline` is still available if that behaviour is
ever wanted.

**Panel morph.** The mobile auth screens measure the pressed button and scale a panel out of its
exact rect via Reanimated. On the web the panel expands from the viewport centre
(`panel-expand`), with matching duration and easing.

**Sign-out confirmation.** `Alert.alert` becomes an inline confirmation inside the settings card.

**Sign-up panel colour.** On mobile, sign-up inverts to a white panel with black text. Inverting on
the web would abandon the glass language mid-flow, so the panel instead steps up to the brightest
glass tier (`glass-raised`). The visual distinction between the two auth screens is preserved; the
palette is not flipped.

**Width.** The signed-in shell is capped at `max-w-2xl` and centred rather than filling a desktop
viewport.
