import { Motion, useInterpolatedStyle, useInView } from '@rootnative/inertia'
import { useRef, type PropsWithChildren } from 'react'
import type { StyleProp, ViewInstance, ViewStyle } from 'react-native'

import { ENTRANCE_MARKER, IN_VIEW } from '../lib/motion'

/** How far a block travels on its way in, in points. The same as a library card. */
const REVEAL_TRAVEL = 28

interface RevealProps {
  style?: StyleProp<ViewStyle>
}

/**
 * Fades a block in when it scrolls into view, as a library card does. It needs
 * a `Motion.ScrollView` around the page, which `useInView` reads.
 *
 * No `initial` here — the block starts hidden because its in-view value starts
 * at 0, which the library cannot see. It carries the marker by hand. See
 * `ENTRANCE_MARKER`.
 */
export function Reveal({ style, children }: PropsWithChildren<RevealProps>) {
  const ref = useRef<ViewInstance>(null)
  const inView = useInView(ref, IN_VIEW)
  const revealStyle = useInterpolatedStyle(inView, {
    opacity: [0, 1],
    translateY: [REVEAL_TRAVEL, 0],
  })

  return (
    <Motion.View ref={ref} dataSet={ENTRANCE_MARKER} style={[style, revealStyle]}>
      {children}
    </Motion.View>
  )
}
