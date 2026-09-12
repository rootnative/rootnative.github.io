import { useCallback } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import {
  useMotionValue,
  useShouldReduceMotion,
  useTransform,
  type SharedValue,
} from '@rootnative/inertia'
// `useMotionValue` is typed `<T extends number | string>`, so it cannot hold
// the array of cell positions. That one value is the only reason this file
// reaches past the library to Reanimated. Filed as R6 in
// `DX-FEEDBACK-rootnative.md`.
import { useSharedValue } from 'react-native-reanimated'

/**
 * The scroll-driven entrance of the page.
 *
 * A block enters when the visitor scrolls to it, not when the bundle loads.
 * The old form gave every card a delay counted from load, so on a phone each
 * card below the fold finished its entrance while it was still off-screen and
 * the visitor scrolled into static content.
 *
 * `@rootnative/inertia` has no in-view trigger of its own — it gives
 * `useScroll`, and nothing that turns a position into an enter event. This
 * file is the workaround, and it is filed as R1 in `DX-FEEDBACK-rootnative.md`.
 * Delete it when the library grows a `useInView`.
 *
 * Every value here is a shared value, so the whole trigger runs on the UI
 * thread and no scroll frame crosses the bridge.
 */

/**
 * Fraction of the viewport height at which a block is fully in place. A block
 * starts to enter when its top crosses the bottom edge (1.0) and finishes when
 * that top reaches this line, so the reveal plays over the last stretch of the
 * travel rather than all at once.
 */
const REVEAL_AT = 0.86

/** Slack, in points, on the "this page cannot scroll" test. */
const SCROLL_EPSILON = 4

/** A top that has not been measured yet. Not `0`, which is a real position. */
const UNMEASURED = -1

export interface RevealSource {
  /** Vertical scroll offset of the page. */
  scrollY: SharedValue<number>
  /** Y of the card grid inside the scroll content. */
  gridTop: SharedValue<number>
  /** Y of each grid cell inside the grid, by card index. */
  cellTops: SharedValue<number[]>
  /** Height of the whole scroll content. `0` until it is measured. */
  contentHeight: SharedValue<number>
  /** Height of the visible scroll area. `0` until it is measured. */
  viewportHeight: SharedValue<number>
}

export interface RevealController {
  source: RevealSource
  /** Put on the `Grid`. */
  onGridLayout: (event: LayoutChangeEvent) => void
  /** Put on each `Grid.Cell`, with that cell's index. */
  onCellLayout: (index: number, event: LayoutChangeEvent) => void
  /** Put on the `Motion.ScrollView`. Records the visible height. */
  onViewportLayout: (event: LayoutChangeEvent) => void
  /** Put on the `Motion.ScrollView`. Records the scrollable height. */
  onContentSizeChange: (width: number, height: number) => void
}

/**
 * Owns every measurement the trigger needs. `app/index.tsx` calls this once
 * and hands the `source` to each block that reveals.
 *
 * The grid is measured in two parts because `Grid.Cell` must be a direct child
 * of `Grid` — the component dev-errors otherwise — so a card cannot render its
 * own cell and cannot own the cell's `onLayout`. The cell reports its Y inside
 * the grid, the grid reports its Y inside the page, and the page column is the
 * scroll content's first child, so those two sum to the absolute position.
 */
export function useRevealSource(scrollY: SharedValue<number>): RevealController {
  const gridTop = useMotionValue(UNMEASURED)
  const cellTops = useSharedValue<number[]>([])
  const contentHeight = useMotionValue(0)
  const viewportHeight = useMotionValue(0)

  const onGridLayout = useCallback(
    (event: LayoutChangeEvent) => {
      gridTop.value = event.nativeEvent.layout.y
    },
    [gridTop],
  )

  const onCellLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const next = [...cellTops.value]
      next[index] = event.nativeEvent.layout.y
      cellTops.value = next
    },
    [cellTops],
  )

  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportHeight.value = event.nativeEvent.layout.height
    },
    [viewportHeight],
  )

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.value = height
    },
    [contentHeight],
  )

  return {
    source: { scrollY, gridTop, cellTops, contentHeight, viewportHeight },
    onGridLayout,
    onCellLayout,
    onViewportLayout,
    onContentSizeChange,
  }
}

/**
 * The absolute Y of one card, or `UNMEASURED` until both halves have reported.
 */
export function useCardTop(source: RevealSource, index: number): SharedValue<number> {
  return useTransform(() => {
    'worklet'
    const cell = source.cellTops.value[index]
    if (cell === undefined || source.gridTop.value === UNMEASURED) {
      return UNMEASURED
    }
    return source.gridTop.value + cell
  })
}

/**
 * `0` while the block is below the fold, `1` once it is in place. Feed it to
 * `useInterpolatedStyle` to drive the entrance.
 *
 * Three cases return `1` outright, and each one is a way the scroll trigger
 * could otherwise strand a block at a value it can never leave:
 *
 * 1. **Reduced motion.** The visitor asked the OS for less motion, so there is
 *    no entrance at all and the block starts at rest.
 * 2. **The page does not scroll.** A viewport tall enough to hold the whole
 *    page leaves `scrollY` at `0` for ever, so a block resting inside the
 *    reveal band would stay half-faded with no way to finish.
 * 3. **A zero-height band.** Guards the division below.
 */
export function useReveal(source: RevealSource, top: SharedValue<number>): SharedValue<number> {
  const reduceMotion = useShouldReduceMotion()

  return useTransform(() => {
    'worklet'
    if (reduceMotion) {
      return 1
    }
    const viewport = source.viewportHeight.value
    if (viewport === 0 || top.value === UNMEASURED) {
      return 0
    }
    const content = source.contentHeight.value
    if (content > 0 && content <= viewport + SCROLL_EPSILON) {
      return 1
    }
    const band = viewport * (1 - REVEAL_AT)
    if (band <= 0) {
      return 1
    }
    const fromViewportTop = top.value - source.scrollY.value
    const progress = (viewport - fromViewportTop) / band
    return progress < 0 ? 0 : progress > 1 ? 1 : progress
  })
}

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
export function useScrollAway(source: RevealSource): {
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
    const gone = source.scrollY.value / travel
    return gone < 0 ? 0 : gone > 1 ? 1 : gone
  })

  return { onLayout, progress }
}

/** A block that measures its own position, for one outside the card grid. */
export function useSelfMeasuredTop(): {
  top: SharedValue<number>
  onLayout: (event: LayoutChangeEvent) => void
} {
  const top = useMotionValue(UNMEASURED)
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      top.value = event.nativeEvent.layout.y
    },
    [top],
  )
  return { top, onLayout }
}
