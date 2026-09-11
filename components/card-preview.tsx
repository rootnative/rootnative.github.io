import { Box, Button, Chip, Row } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import { Motion, Stagger } from '@rootnative/inertia'
import { StyleSheet } from 'react-native'

import { PREVIEW_INTERVAL } from '../lib/motion'
import type { PreviewKind } from '../lib/libraries'

/** Heights of the inertia preview bars, in points. */
const BAR_HEIGHTS = [18, 30, 24, 38, 22]

/** How far a bar travels, in points. */
const BAR_TRAVEL = -12

interface CardPreviewProps {
  kind: PreviewKind
}

/**
 * The live region of a featured card. Each one runs the library it sits on
 * rather than describing it: the inertia card animates, and the ui card is
 * built from the components it ships.
 */
export function CardPreview({ kind }: CardPreviewProps) {
  const theme = useTheme()

  return (
    <Box
      align="center"
      justify="center"
      px="lg"
      style={[styles.stage, { backgroundColor: theme.colors.surfaceContainerLow }]}
    >
      {kind === 'motion' ? <MotionPreview /> : <ComponentsPreview />}
    </Box>
  )
}

/**
 * Five bars on one `<Stagger>`. The cascade is the point — this is the shape
 * `inertia` exists to make declarative, and it is written the way a consumer
 * would write it.
 *
 * `repeat: 'infinite'` alternates, so one leg is enough. Under reduced motion
 * every bar snaps to its `animate` value and holds there, which is a row of
 * bars at rest — the page stays readable with no motion at all.
 */
function MotionPreview() {
  const theme = useTheme()

  return (
    <Row align="flex-end" gap="sm" style={styles.bars}>
      <Stagger interval={PREVIEW_INTERVAL}>
        {BAR_HEIGHTS.map((height, index) => (
          <Motion.View
            key={index}
            animate={{ translateY: BAR_TRAVEL }}
            transition="bob"
            style={[
              styles.bar,
              {
                height,
                backgroundColor: index % 2 === 0 ? theme.colors.primary : theme.colors.tertiary,
              },
            ]}
          />
        ))}
      </Stagger>
    </Row>
  )
}

/** Real components from the library the card is about, at rest. */
function ComponentsPreview() {
  return (
    <Row align="center" gap="sm" justify="center" wrap>
      <Chip leadingIcon="palette">Themed</Chip>
      <Button variant="filled" size="xs">
        Filled
      </Button>
      <Button variant="outlined" size="xs">
        Outlined
      </Button>
    </Row>
  )
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  // The bars travel upward, so the row needs the headroom that the tallest
  // bar plus its travel takes, or the stage clips the top of the cascade.
  bars: {
    height: 56,
  },
  bar: {
    width: 10,
    borderRadius: 999,
  },
})
