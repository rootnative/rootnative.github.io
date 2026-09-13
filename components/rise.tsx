import { Motion } from '@rootnative/inertia'
import type { PropsWithChildren } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import { ENTRANCE } from '../lib/motion'

interface RiseProps {
  /**
   * Milliseconds to wait before this block starts. Omit it inside a
   * `<Stagger>`, which gives every slot its own delay.
   */
  delay?: number
  style?: StyleProp<ViewStyle>
}

/** Fades a block in and lifts it into place. The one entrance of the page. */
export function Rise({ delay, style, children }: PropsWithChildren<RiseProps>) {
  return (
    <Motion.View
      initial={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={delay === undefined ? 'entrance' : { ...ENTRANCE, delay }}
      style={style}
    >
      {children}
    </Motion.View>
  )
}
