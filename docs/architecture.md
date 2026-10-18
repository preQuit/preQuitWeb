# Architecture

Four layers, each depending only inward. `domain` knows nothing about HTTP, React or Next.js;
`application` knows only `domain`; `data` implements `domain` ports; `presentation` composes the
other three and is the only layer that imports React.

```
app/                        Next.js routes — one server shell per route, nothing else
src/
  domain/                   entities, value helpers, errors, repository ports
  application/              one use case per class, orchestrating ports
  data/                     Axios client, mappers, port implementations, browser storage
  presentation/
    container/              createContainer, DependencyProvider
    query/                  QueryProvider, queryKeys
    hooks/                  view models, one per screen concern
    screens/                the screen components the routes render
    components/             shared UI primitives
    navigation/             route constants and session guards
    theme/                  colour and motion tokens
```

Every file under `app/` is five lines: it declares `instant = false` and renders one screen from
`src/presentation/screens/`. Route segment config such as `instant` is only valid in a server module,
so keeping the screens (which are client components) one level in is what lets the routes carry it —
and it keeps the whole UI inside the presentation layer where the dependency rule can see it.

## Dependency rule

```
presentation ──▶ application ──▶ domain
      │                             ▲
      └────────▶ data ──────────────┘
```

`data` and `presentation` both point at `domain`; nothing points back out. A screen never imports
Axios, and a repository never imports React.

## Layer responsibilities

### domain

Plain data and pure functions. `createPost`, `createUser`, `createMessage` normalise untrusted
payloads into fully-populated entities, so no consumer handles `undefined`. State transitions are
pure: `withLikeToggled` returns a new `Post` with the flag flipped and the counter adjusted, which is
what makes optimistic updates and their rollback trivial.

`AppError` is the single error type the rest of the app sees. It classifies itself —
`isOffline`, `isRetryable`, `requiresSignIn` — so retry policy and sign-out handling are decided by
the error, not by scattered status-code checks.

Repository *ports* live here (`FeedRepository`, `PostRepository`, …). They are interfaces, phrased in
domain terms, with no transport detail.

### application

One class per use case, constructor-injected with the ports it needs. Each has a single `execute`.
This is where cross-port orchestration lives — `SignInUseCase` authenticates *and* persists the
session; `RestoreSessionUseCase` decides that an offline failure with a cached user still counts as
signed in.

### data

`AxiosHttpClient` is the only place that knows the wire format. It:

- unwraps the backend's `{ data }` / `{ data, pageInfo }` envelopes
- attaches the bearer token, skipping it for public calls
- refreshes an expired access token once per 401, with a single in-flight refresh shared by all
  concurrent callers, then replays the original request
- clears the session and notifies listeners when refresh fails
- converts every failure into an `AppError`

Mappers (`PostMapper`, `MessagingMapper`, …) translate DTOs to entities and absorb the backend's
shape variations, so a server-side field rename touches one file.

### presentation

`createContainer()` wires concrete implementations to ports once and exposes them through
`DependencyProvider`. Hooks reach dependencies via `useUseCases()`, never by importing a repository.
Swapping an implementation — a fake repository in a test, for instance — is a one-line change at the
composition root.

`useFeed`, `useSearch`, `useComments`, `useConversation(s)`, `useProfile` and `useSession` are the
view models. Each returns a flat, UI-ready object; components contain no fetching logic.

## Server state: TanStack Query

Every read is a `useQuery`; every write a `useMutation`. Keys are centralised in `queryKeys.ts`.

- Retry policy is delegated to the domain: only `AppError.isRetryable` errors retry, up to twice.
- Likes and saves update the cached feed page immediately and restore the captured previous post
  on failure.
- Outgoing messages insert a `pending` message in `onMutate`, swap it for the server's message in
  `onSuccess`, and mark it `failed` in `onError` — the same three-state model the mobile app uses.
- Conversations poll every 20s and an open thread every 8s. The backend supports Socket.IO, but the
  mobile app does not use it, so the web client matches that behaviour rather than inventing a
  channel the rest of the product does not have.

## Routing and guards

Route groups separate the two shells: `(auth)` for unauthenticated pages, `(app)` for the signed-in
shell that renders the glass tab bar. `RequireSession` and `RequireGuest` each redirect and render a
spinner while the session restores. The splash page is the exception — it paints its hero immediately
and only fades its buttons in once the session has settled, matching the mobile splash.

Because a guard withholds its children until the session resolves, those segments never render during
prerender, which Next 16's partial-prefetch validation reports as an unrendered segment. Each route
declares `export const instant = false` to opt out of that validation; the gating is deliberate, since
rendering a guarded screen early would fire authenticated queries before the redirect.

## How the SOLID principles land here

- **Single responsibility** — a use case does one thing; `AxiosHttpClient` owns transport only;
  mappers own translation only; a component renders.
- **Open/closed** — adding a feature means a new entity, port, use case and mapper. Existing files are
  extended by composition at the container, not edited.
- **Liskov substitution** — the port is the contract. The container can hand hooks any
  `FeedRepository`, HTTP-backed or otherwise, with no consumer change.
- **Interface segregation** — ports are split per concern (`AuthRepository`, `SocialRepository`, …)
  rather than one wide repository, so no implementation carries methods it does not need.
- **Dependency inversion** — `application` depends on interfaces it declares; `data` supplies them;
  `createContainer` is the only place the two meet.
