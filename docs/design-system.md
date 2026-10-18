# Design system

Black base, white ink, three accent hues taken from the mobile splash screen's orbiting dots. The web
client keeps the mobile palette and proportions and pushes the glass further: real backdrop blur,
saturation lift, layered inset highlights and a slow ambient aurora behind every page — none of which
the React Native build could do cheaply.

## Tokens

Declared in `app/globals.css` under `@theme`, so each is available as a Tailwind utility
(`bg-ink`, `text-muted`, `border-glass-line`).

| Token | Value | Use |
| --- | --- | --- |
| `--color-ink` | `#000000` | Page ground |
| `--color-paper` | `#ffffff` | Primary text, solid buttons |
| `--color-orbit-red` | `#ff3b30` | Aurora layer, splash orbit |
| `--color-orbit-violet` | `#8a2be2` | Aurora layer, splash orbit |
| `--color-orbit-blue` | `#2e7dff` | Aurora layer, splash orbit |
| `--color-like` | `#ff375f` | Liked heart |
| `--color-danger` | `#ff453a` | Sign out |
| `--color-failure` | `#ff6b6b` | Form errors |
| `--color-glass-line` | `rgba(255,255,255,0.14)` | Default glass edge |
| `--color-glass-edge` | `rgba(255,255,255,0.25)` | Focus / raised edge |
| `--color-muted` | `rgba(255,255,255,0.5)` | Secondary text |
| `--color-faint` | `rgba(255,255,255,0.4)` | Placeholders, idle icons |

Typography: **Anton** for display (the closest web face to the mobile build's Impact /
`sans-serif-black`), **Inter** for body. Both self-hosted through `next/font`.

## Glass utilities

Four surfaces, so depth is expressed by which one you pick rather than by ad-hoc class strings.

| Utility | Blur | Where |
| --- | --- | --- |
| `glass` | 22px, saturate 160% | Default surface: post cards, fields, pills, buttons |
| `glass-subtle` | 14px, saturate 140% | Nested inside another glass surface — avatars, reason pills |
| `glass-raised` | 32px, saturate 180% | Floats above content: comment sheet, sign-up panel, profile avatar |
| `glass-bar` | 28px, saturate 170% | The tab bar only, over a `rgba(20,20,20,0.5)` ground |

Each carries an inset top highlight, and the two heavier ones carry a long downward shadow. That
combination is what reads as thickness rather than as a flat translucent rectangle.

`display-title` applies the display face with its tracking. `no-scrollbar` hides a scrollbar while
keeping the scroll.

## Motion

| Animation | Duration | Where |
| --- | --- | --- |
| `animate-aurora` | 18s alternate | Three blurred colour fields drifting behind every page |
| `animate-rise` | 420ms | Post cards and the splash action buttons entering |
| `animate-sheet` | 320ms | Comment sheet rising from the bottom edge |
| `animate-fade` | 450ms | Splash header |
| `animate-pulse-sun` | 3.2s loop | Splash core, matching the mobile sun pulse |
| `orbit-spin` | 4s / 6.5s / 9s | Splash orbit dots — alternating direction, as on mobile |
| `panel-expand` | 340ms | Auth panels, standing in for the mobile button-to-screen morph |

Durations and easings are carried over from the React Native `withTiming` calls so the two clients
feel the same.

## Components

`src/presentation/components/`

| Component | Role |
| --- | --- |
| `AmbientBackdrop` | Fixed aurora layers plus a top radial wash; rendered once in the root layout |
| `SolarSystem` | Splash rings, orbiting dots and pulsing core |
| `GlassTabBar` | Fixed bottom nav; the active tab lifts, grows a circle and reveals its label |
| `PostCard` | Author, reason pill, body, media, topics, like / comment / save actions |
| `CommentSheet` | Bottom sheet with its own list, empty state and composer; closes on Escape or backdrop |
| `AuthPanel` | Expanding glass shell for the three auth screens, `dark` or `bright` |
| `GlassField`, `PasswordField` | Inputs with a focus-reactive edge; the password variant owns its reveal toggle |
| `GlassButton` | `solid`, `glass` or `outline` |
| `Avatar` | Image or derived initial, four sizes; the initial skips punctuation so `@handle` yields `H` |
| `EmptyState`, `Spinner`, `SectionLabel`, `FormError`, `FormNotice`, `ScreenHeader` | Shared primitives |

## Responsiveness and accessibility

The signed-in shell is capped at `max-w-2xl` and centred, so the mobile layout holds its proportions
on a desktop monitor instead of stretching. The comment sheet is a bottom sheet under `sm` and a
centred dialog above it.

Interactive elements are real `button` and `a` elements. Toggles expose `aria-pressed`, the feed
surface switcher is a `tablist`, the sheet is a labelled `role="dialog"`, errors are `role="alert"`
and notices `role="status"`. Focus is visible as a white ring, since the default outline disappears
against glass.
