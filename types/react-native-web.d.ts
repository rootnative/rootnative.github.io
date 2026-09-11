import 'react-native'

/**
 * Props that react-native-web forwards to the DOM node and the react-native
 * types do not declare, because each one does nothing on iOS and Android.
 *
 * Both are verified against the installed react-native-web, not assumed:
 * `View` builds its forward list from `forwardedProps`, and `dataSet` is in
 * `defaultProps` while `onFocus` / `onBlur` are in `focusProps`.
 */
declare module 'react-native' {
  interface ViewProps {
    /**
     * Writes each key out as a `data-*` attribute. This site needs it so
     * `app/+html.tsx` can reach the animated elements with plain CSS.
     */
    dataSet?: Record<string, string | number | undefined>
    /**
     * DOM focus, which bubbles — React listens for `focusin`. A card uses it
     * to raise its hover layer when a visitor tabs to a button inside it, so
     * the keyboard path gets the same highlight the pointer path gets.
     */
    onFocus?: () => void
    onBlur?: () => void
  }
}
