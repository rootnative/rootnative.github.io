import 'react-native'

/**
 * `dataSet` is a react-native-web extension: it writes each key out as a
 * `data-*` attribute on the DOM node. The react-native types do not declare
 * it, because it does nothing on iOS and Android. This site needs it so
 * `app/+html.tsx` can reach the animated elements with plain CSS.
 */
declare module 'react-native' {
  interface ViewProps {
    dataSet?: Record<string, string | number | undefined>
  }
}
