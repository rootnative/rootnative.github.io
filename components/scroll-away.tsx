import { Motion, useInterpolatedStyle, type SharedValue } from '@rootnative/inertia'
import type { PropsWithChildren } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

interface ScrollAwayProps {
  /** `0` at the top of the page, `1` once the hero has gone. */
  progress: SharedValue<number>
  /** How far this layer drifts up on the way out, in points. */
  drift: number
  /** Scale at the end of the drift. Omit to hold the layer at full size. */
  scaleTo?: number
  style?: StyleProp<ViewStyle>
}

/**
 * One layer of the hero's scroll response. It drifts up and fades as the
 * visitor scrolls past, and a different `drift` per layer is what separates
 * them on the way out.
 *
 * Each instance calls the hook itself because each layer interpolates over a
 * different `drift`, so there is no one style for the page to hoist and share.
 *
 * This is a layer of its own, below the `Rise` that owns the entrance, for the
 * same reason the card's hover is: two sources must never drive one element's
 * `transform`. `Rise` owns the way in, this owns the way out.
 */
export function ScrollAway({
  progress,
  drift,
  scaleTo,
  style,
  children,
}: PropsWithChildren<ScrollAwayProps>) {
  const driftStyle = useInterpolatedStyle(progress, {
    opacity: [1, 0],
    translateY: [0, -drift],
    scale: [1, scaleTo ?? 1],
  })

  return <Motion.View style={[style, driftStyle]}>{children}</Motion.View>
}
