# API contract

Base URL `${NEXT_PUBLIC_API_BASE_URL}` (default `http://localhost:4000/api/v1`).

Every response shape below was verified by running this client's repositories against a live backend
(memory persistence, local media) with real users, a real post, comments, likes, follows and
messages.

## Envelopes

The backend uses two:

```json
{ "data": { } }
{ "data": [ ], "pageInfo": { "nextCursor": null, "hasMore": false }, "meta": {} }
```

`AxiosHttpClient.get` unwraps the first. `getPage` handles both: it returns `data.items` /
`data.nextCursor` when `data` is itself a page object (the feed endpoints), and otherwise treats
`data` as the array and reads the cursor from `pageInfo`.

Errors are always:

```json
{ "error": { "code": "…", "message": "…", "details": [], "requestId": "…" } }
```

`code` becomes `AppError.code`, which drives retry and sign-out behaviour. Codes seen in practice:
`VALIDATION_FAILED` (422), `EMAIL_NOT_VERIFIED`, `USER_NOT_FOUND`, `MEDIA_NOT_READY`,
`CAPACITY_EXHAUSTED`, `RATE_LIMIT_EXCEEDED`, `ROUTE_NOT_FOUND`, `INTERNAL_ERROR`.

## Endpoints used by this client

### Auth — `HttpAuthRepository`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | `{ handle, displayName, email, password, dateOfBirth }` → `{ user, nextStep: "verify_email" }`. Returns 201; the account stays `pending_verification`. |
| POST | `/auth/login` | public | `{ identifier, password }` → `{ accessToken, refreshToken, expiresIn, refreshExpiresIn, user }`. The login `user` omits `email`; `/auth/me` carries it. |
| POST | `/auth/refresh` | public | `{ refreshToken }` → new token pair. Called only by the client's 401 interceptor. |
| POST | `/auth/logout` | bearer | 204. |
| GET | `/auth/me` | bearer | Full `MyProfileDto`, including `email` and `emailVerified`. |
| GET | `/auth/handle-available?handle=` | public | `{ available: boolean }`. |
| POST | `/auth/password/forgot` | public | 202 `{ accepted: true }` — always, whether or not the address exists. |

### Feed — `HttpFeedRepository`

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/feed/home?limit=` | bearer |
| GET | `/feed/explore?limit=` | optional |
| GET | `/feed/trending?limit=` | optional |

All three return `{ data: { items: [{ post, reason, score }], nextCursor } }`. `reason` is what the
card's pill renders — observed values include `{ kind: "fresh", label: "Recently posted" }` and
`{ kind: "trending", label: "Trending right now" }`.

`post` is the full `PostProjection`: `author{id,handle,displayName,avatarUrl}`, `description`,
`media[{id,urls{thumb,feed,full},width,height,placeholder,altText}]`, `hashtags`, `mentions`,
`topics[{slug,label,weight,source}]`, `visibility`, `status`, `counts{likes,comments,shares,saves}`,
`viewer{hasLiked,hasSaved,canEdit,canDelete}`, `publishedAt`.

### Posts, comments, engagement — `HttpPostRepository`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/posts/:postId` | optional | One `PostProjection`. |
| POST / DELETE | `/posts/:postId/likes` | verified | `{ liked: true }` / 204. |
| POST / DELETE | `/posts/:postId/saves` | verified | `{ saved: true }` / 204. |
| GET | `/posts/:postId/comments?limit=&sort=` | optional | Paged array. |
| POST | `/posts/:postId/comments` | verified | `{ body, parentId }` → 201 with the created comment. |

### Messaging — `HttpMessagingRepository`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/conversations?limit=` | verified | `{ id, state, participantIds, lastMessage, createdAt }` per row. |
| POST | `/conversations` | verified | `{ userId }` → `{ id }`; 201 when newly created, 200 when it already existed. |
| GET | `/conversations/:id/messages?limit=&before=` | verified | Paged array. |
| POST | `/conversations/:id/messages` | verified | `{ body, clientNonce }` → 201 with the message. |
| POST | `/conversations/:id/read` | verified | Marks the thread read. |

`state` is `active | read_only | closed`. Messages carry
`{ id, conversationId, senderId, kind, body, media, replyToId, reactions, editedAt, deletedAt, createdAt }`.
`mine` and the pending/sent/failed delivery state are client-side concepts, derived from the viewer
id and the mutation lifecycle.

### Search — `HttpSearchRepository`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/search?q=&limit=` | optional | `{ interpretation, posts[{post,match}], people[{user,expertise,viewer}], topics[{slug,label,postCount,isFollowing}] }`. |
| GET | `/search/trending?limit=` | public | `{ topics: TopicHit[], hashtags: [{tag,postCount}] }` — **not** a bare array; see gap 1. |

### Profile and social — `HttpProfileRepository`, `HttpSocialRepository`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/me/profile` | bearer | Same payload as `/auth/me`. |
| PATCH | `/me/profile` | verified | `{ displayName?, bio?, isPrivate?, links? }`. |
| GET | `/users/:handle` | optional | **Handle only** — an id returns `USER_NOT_FOUND`; see gap 2. |
| GET | `/users/:userId/posts?limit=` | optional | Paged array of posts. |
| POST / DELETE | `/users/:userId/follow` | verified / bearer | `{ relationship, isMutual }` / 204. |
| GET | `/me/mutuals` | bearer | Array of user id strings. |
| GET | `/users/suggested?limit=` | bearer | Array of user summaries. |

## Verified backend gaps

These are server-side omissions, not client bugs. The client degrades rather than showing blanks, and
each becomes correct the moment the backend fills the field — no client change needed.

1. **`/search/trending` returns an object, not a list.** `HttpSearchRepository` reads `.topics`.
   The mobile app's `rowsOf` helper does not, so trending topics are silently empty there.

2. **`/conversations` omits the peer profile and `unreadCount`.** Rows carry only `participantIds`,
   and there is no by-id profile endpoint to resolve them with. `nameOf()` therefore falls back to
   `User <last 6 of id>`, and the unread badge never appears because the count is always absent.
   Returning a `participant` object and `unreadCount` on each row fixes both.

3. **Comment payloads omit the author's handle and display name.** Only `authorId` is sent, so
   `authorLabelOf()` falls back to `User <last 6 of id>`.

## Media

Creating a post requires media that is already uploaded and confirmed: request a ticket from
`POST /media/upload-tickets`, upload to the returned `uploadUrl`, then `POST /media/:mediaId/confirm`
with the `public_id` the ticket issued. Confirming with any other id is rejected
(`MEDIA_VALIDATION_FAILED`), and publishing before confirmation fails with `MEDIA_NOT_READY`.

This client does not compose posts — the mobile app does not either — so it reads media but never
uploads it.

## Realtime

The backend exposes Socket.IO on the API origin, authenticated with the access token via
`handshake.auth.token`. Clients join `conversation:<id>` by emitting `conversation:join`, and receive
`message:new` and `notification:new`. The mobile app does not connect, so this client polls instead
(20s for the conversation list, 8s for an open thread). Switching to sockets later means adding one
gateway in `data/` and invalidating the relevant query keys — no change above the data layer.
