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
  /**
   * `false` keeps the block visible from the first paint and only lifts it.
   * Use it for the largest text in the first viewport. A browser does not
   * count an element at `opacity: 0` as the Largest Contentful Paint, so a
   * faded tagline made the mobile LCP wait for the whole script bundle.
   */
  fade?: boolean
  style?: StyleProp<ViewStyle>
}

const RISE_FROM = 14

/** Lifts a block into place, and fades it in unless `fade` is `false`. The one entrance of the page. */
export function Rise({ delay, fade = true, style, children }: PropsWithChildren<RiseProps>) {
  return (
    <Motion.View
      initial={fade ? { opacity: 0, translateY: RISE_FROM } : { translateY: RISE_FROM }}
      animate={fade ? { opacity: 1, translateY: 0 } : { translateY: 0 }}
      transition={delay === undefined ? 'entrance' : { ...ENTRANCE, delay }}
      style={style}
    >
      {children}
    </Motion.View>
  )
}
