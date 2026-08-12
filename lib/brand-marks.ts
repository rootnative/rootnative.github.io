/**
 * Brand mark URLs, read from each library's own repository at view time.
 *
 * A mark that changes there reaches this site without a release here.
 * `raw.githubusercontent.com` sends `cache-control: max-age=300`, so an update
 * lands about five minutes after the push, and `access-control-allow-origin: *`,
 * so the web build can read it.
 *
 * There is no bundled copy. If the request fails — an offline visitor, a GitHub
 * outage, or a mark renamed upstream — the card shows no logo.
 */
const RAW = 'https://raw.githubusercontent.com'

export const MARK_UI = `${RAW}/rootnative/ui/main/assets/brand/rootnative-mark.png`

export const MARK_INERTIA = `${RAW}/rootnative/inertia/main/assets/brand/inertia-mark.png`
