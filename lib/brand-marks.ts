/**
 * Brand mark URLs, read from GitHub at view time.
 *
 * A mark that changes upstream reaches this site without a release here. Both
 * hosts below send `cache-control: max-age=300`, so an update lands about five
 * minutes later, and `access-control-allow-origin: *`, so the web build can
 * read them.
 *
 * There is no bundled copy of any of them. If the request fails — an offline
 * visitor, a GitHub outage, or a mark renamed upstream — that mark shows as
 * nothing.
 */
const RAW = 'https://raw.githubusercontent.com'

/**
 * The organisation's own mark: the `rootnative` GitHub org avatar.
 *
 * The org has no repository of its own, so the avatar IS the source of truth —
 * it is changed in GitHub's org settings, not by a commit anywhere. That is why
 * this URL is the org name rather than a path into a repo.
 *
 * Two things make it unlike the library marks below:
 *
 * 1. **It is opaque.** The library marks are transparent PNGs that sit straight
 *    on the page. This one is a filled near-black square, so whatever draws it
 *    has to clip it to a rounded tile — see `radius` on `BrandMark`. Rendered
 *    bare it is a black box on a light page.
 * 2. **It is served at a requested size.** `?size=144` returns a 13 KB PNG
 *    where the unsized URL returns 148 KB, and 144 is twice the 72 px the hero
 *    draws, so it stays sharp on a 2x display. Raise it if the mark is ever
 *    drawn larger.
 *
 * `https://github.com/rootnative.png` resolves to the same image but answers
 * 302 first, and the numeric `avatars.githubusercontent.com/u/<id>` form says
 * nothing about whose avatar it is. This form is one request and readable.
 */
export const MARK_ORG = 'https://avatars.githubusercontent.com/rootnative?size=144'

export const MARK_UI = `${RAW}/rootnative/ui/main/assets/brand/rootnative-mark.png`

export const MARK_INERTIA = `${RAW}/rootnative/inertia/main/assets/brand/inertia-mark.png`

export const MARK_IMPULSE = `${RAW}/rootnative/impulse/main/assets/brand/impulse-mark.png`

export const MARK_GAME_ENGINE = `${RAW}/rootnative/game-engine/main/assets/brand/game-engine-mark.png`
