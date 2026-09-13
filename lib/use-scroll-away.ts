import { useCallback } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import {
  useMotionValue,
  useShouldReduceMotion,
  useTransform,
  type SharedValue,
} from '@rootnative/inertia'

/**
 * The hero's scroll response.
 *
 * This file used to hold the whole entrance of the page as well — a hand-built
 * in-view trigger that scrubbed each block's progress off the scroll position,
 * with a two-part grid measurement behind it because `Grid.Cell` must be a
 * direct child of `Grid`. inertia 0.0.12 added `useInView`, so the cards and
 * the footer each hold a ref and read their own visibility, and all of that is
 * gone. What is left is the one thing `useInView` does not answer: how far the
 * hero has scrolled away, which is a position and not a yes-or-no.
 */

/**
 * How much of the hero's height the visitor scrolls before the hero has fully
 * left. Less than `1`, because the hero's upper block — the badge, the mark,
 * the title, the tagline — sits in the top of that height and reaches the
 * viewport edge well before the hero's last row does.
 */
const SCROLL_AWAY_TRAVEL = 0.7

/**
 * `0` at the top of the page, `1` once the block has scrolled away.
 *
 * This is the hero's scroll response: the page moves, and the hero leaves at
 * its own rate instead of riding along. Drive a drift and a fade from it, and
 * give each layer its own distance so they separate as they go — that
 * separation is the whole depth cue.
 *
 * Under reduced motion this stays at `0`, so the hero holds still and stays
 * fully opaque. A visitor who asked the OS for less motion gets a page that
 * simply scrolls.
 */
export function useScrollAway(scrollY: SharedValue<number>): {
  onLayout: (event: LayoutChangeEvent) => void
  progress: SharedValue<number>
} {
  const reduceMotion = useShouldReduceMotion()
  const height = useMotionValue(0)

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      height.value = event.nativeEvent.layout.height
    },
    [height],
  )

  const progress = useTransform(() => {
    'worklet'
    if (reduceMotion || height.value === 0) {
      return 0
    }
    const travel = height.value * SCROLL_AWAY_TRAVEL
    const gone = scrollY.value / travel
    return gone < 0 ? 0 : gone > 1 ? 1 : gone
  })

  return { onLayout, progress }
}
