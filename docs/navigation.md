# Navigation

Two surfaces render the same destinations: `SideRail` (a persistent panel, `md` and up) and
`GlassTabBar` (a floating bar below `md`). Both read one declaration, so a route cannot end up
with two different names or two different icons depending on viewport width.

## The declaration

`src/presentation/navigation/navItems.ts` owns the structure; components only walk it.

| Export | Shape | Rendered by |
| --- | --- | --- |
| `PRIMARY_NAV` | `NavItem[]` | Both surfaces |
| `SECONDARY_NAV` | `NavItem[]` | `SideRail` only |
| `SIDEBAR_SECTIONS` | `NavSection[]` | `SideRail`, as grouped cards in order |
| `IDENTITY_ROWS` | `IdentityRow[]` | `SideRail`, as the read-only contact card |

`NavItem` carries `icon` (a Lucide component) plus an optional `animatedIcon` path and an optional
`trailing(user)` accessor. `IdentityRow` is deliberately a **separate interface**: those rows carry
a value and link nowhere, so giving them an `href` they would never use just to share one type
would be the wrong trade.

Adding a menu entry, a group, or a trailing count is a change to this file only.

## Icons

Animated glyphs live in `public/icons/nav/` and are referenced through the `NAV_ICONS` map in
`navigation/navIcons.ts` — never by literal path, so swapping an asset is one line.

`components/NavGlyph.tsx` draws them. The Lucide icon is the contract and the animated asset is an
enhancement layered on top: if a GIF 404s or is blocked, `onError` swaps back to the line icon
rather than leaving an empty tile. Tiles keep the app palette, because the assets bring their own
colour and tinting the container as well would make every row compete.

> The GIFs are third-party assets pulled from Giphy. They are fine for local development; clear the
> licensing before shipping them publicly, or replace them with owned artwork — the `NAV_ICONS` map
> is the single place that has to change.

## Layout and the rail width

`--spacing-rail` in `app/globals.css` is consumed twice and the two must not drift apart:

- `SideRail` sets its own width with `w-rail`
- `AppChrome` offsets page content with **`md:pl-rail`**

The `md:` prefix matters. `SideRail` is `hidden md:flex`, so an unconditional `pl-rail` reserved the
rail's width on small screens where it never renders, leaving every mobile page with a dead
left gutter.

## SOLID mapping

| Principle | Where |
| --- | --- |
| Single responsibility | `NavGlyph` draws a glyph; `NavRow` draws a row; `SideRail` only composes them |
| Open/closed | A new row or group is an entry in `navItems.ts`; no component changes |
| Liskov | Every row renders identically whether or not it has an animated icon — the fallback preserves the contract |
| Interface segregation | `NavItem` and `IdentityRow` are separate, so neither carries fields it never uses |
| Dependency inversion | `SideRail` depends on the `NavItem` / `IdentityRow` abstractions and on `useMyProfile()`, which resolves through the DI container — never on a repository or a literal asset path |
