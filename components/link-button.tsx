import { Button, type ButtonProps } from '@rootnative/components'
import { Link } from 'expo-router'

interface LinkButtonProps extends ButtonProps {
  /** An absolute URL. Every link on this page leaves the site. */
  href: string
}

/**
 * The rel and target of an anchor that opens in a new tab.
 *
 * `<Link asChild>` hands `target` to its child as a plain prop, and
 * react-native-web drops it, so the anchor gets no target and Expo Router opens
 * the URL in the same tab. `hrefAttrs` is the prop react-native-web writes onto
 * the `<a>`. With a target set, Expo Router leaves the click to the browser.
 */
const NEW_TAB = { target: '_blank', rel: 'noopener' }

/**
 * A `Button` that renders as a real `<a href>` on the web, so a crawler can
 * follow it and a visitor can copy it or open it with a modifier key.
 *
 * It opens in a new tab, which is what `Linking.openURL` did when each of these
 * was a plain button.
 */
export function LinkButton({ href, ...button }: LinkButtonProps) {
  return (
    <Link href={href} asChild>
      <Button hrefAttrs={NEW_TAB} {...button} />
    </Link>
  )
}
