import 'react-native'

/**
 * Props that react-native-web writes to the DOM node and the react-native types
 * do not declare, because they do nothing on iOS and Android.
 *
 * Verified against the installed react-native-web, not assumed: `View` builds
 * its forward list from `forwardedProps`, and `dataSet` is in `defaultProps`.
 *
 * `onFocus` and `onBlur` used to be declared here too. React Native 0.86 has
 * both on `ViewProps` itself, so the local copy is gone. `hrefAttrs` went the
 * same way, because `@rootnative/components` declares it. A second declaration
 * with a different type fails with TS2717.
 */
declare module 'react-native' {
  interface ViewProps {
    /**
     * Writes each key out as a `data-*` attribute. This site needs it so
     * `app/+html.tsx` can reach the animated elements with plain CSS.
     */
    dataSet?: Record<string, string | number | undefined>
  }
}
