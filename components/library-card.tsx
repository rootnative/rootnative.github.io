import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Box, Button, Card, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import {
  Motion,
  Presence,
  useColorTransition,
  useGesture,
  useInterpolatedStyle,
  useShadow,
  useTransform,
} from '@rootnative/inertia'
import { Linking, StyleSheet } from 'react-native'

import { statusFromVersion, type Library } from '../lib/libraries'
import { ENTRANCE_MARKER } from '../lib/motion'
import { useCardTop, useReveal, type RevealSource } from '../lib/use-reveal'
import { useNpmVersion } from '../lib/use-npm-version'
import { BrandMark } from './brand-mark'
import { CardPreview } from './card-preview'

/** How far a card travels on its way in, in points. */
const REVEAL_TRAVEL = 28

/** Height of a card's live preview region, in points. */
const PREVIEW_HEIGHT = 128

/** The resting and hovered shadow of a card. */
const SHADOW_REST = {
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
}
const SHADOW_HOVER = {
  shadowOpacity: 0.18,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 12 },
  elevation: 8,
}

interface LibraryCardProps extends Library {
  /** Position in `LIBRARIES`. Identifies this card's cell to the reveal. */
  index: number
  /** The page's scroll measurements. `app/index.tsx` owns them. */
  reveal: RevealSource
}

export function LibraryCard({
  name,
  icon,
  mark,
  description,
  status: fallbackStatus,
  npmPackage,
  meta,
  githubUrl,
  demoUrl,
  featured,
  preview,
  index,
  reveal,
}: LibraryCardProps) {
  const theme = useTheme()
  const { version, ready } = useNpmVersion(npmPackage)
  // Derive status from the published version, falling back to the static one.
  const status = npmPackage ? statusFromVersion(version) : fallbackStatus

  // The entrance. It runs off scroll position, not off a delay counted from
  // page load, so a card below the fold still enters where the visitor sees
  // it. `lib/use-reveal.ts` explains why this is hand-built.
  const top = useCardTop(reveal, index)
  const progress = useReveal(reveal, top)
  const revealStyle = useInterpolatedStyle(progress, {
    opacity: [0, 1],
    translateY: [REVEAL_TRAVEL, 0],
  })

  // One gesture, four animated targets. `useGesture` exists for exactly this:
  // the `gesture` prop animates only the element that carries it, and the
  // lift, the shadow, the border, and the mark are four different elements.
  //
  // The handler bag is `Pressable` shaped, but the handlers are plain
  // callbacks, so a `View`'s pointer events can raise the same layers. That
  // matters: a `Pressable` wrapper renders `tabindex="0"` and a pointer
  // cursor even with `focusable={false}` and `accessible={false}`, which put
  // five dead keyboard stops on the page for a surface that has no action.
  // `onPointerEnter` / `onPointerLeave` are `ViewProps` from React Native
  // 0.71 up, and react-native-web maps them to the DOM events of the same
  // name. They no-op on native, exactly as `hovered` does.
  const { hovered, focused, handlers } = useGesture('hover')
  // Focus counts as well as hover, so a visitor who tabs to a button inside
  // the card gets the same highlight a pointer gets. DOM focus bubbles, so
  // the wrapper sees a child's focus without being focusable itself.
  const active = useTransform(() => {
    'worklet'
    return Math.max(hovered.value, focused.value)
  })
  const liftStyle = useInterpolatedStyle(active, { translateY: [0, -6], scale: [1, 1.012] })
  const shadowStyle = useShadow({ from: SHADOW_REST, to: SHADOW_HOVER, progress: active })
  const borderStyle = useColorTransition(
    active,
    [theme.colors.outlineVariant, theme.colors.primary],
    { key: 'borderColor' },
  )
  const markStyle = useInterpolatedStyle(active, { scale: [1, 1.08] })

  // One container role per status, most-released first.
  const statusColors = {
    stable: { bg: theme.colors.primaryContainer, fg: theme.colors.onPrimaryContainer },
    beta: { bg: theme.colors.tertiaryContainer, fg: theme.colors.onTertiaryContainer },
    alpha: { bg: theme.colors.secondaryContainer, fg: theme.colors.onSecondaryContainer },
    experimental: { bg: theme.colors.surfaceVariant, fg: theme.colors.onSurfaceVariant },
    'in the lab': { bg: theme.colors.surfaceVariant, fg: theme.colors.onSurfaceVariant },
  }[status]

  return (
    // The entrance is the outer layer and the hover is the inner one, so a
    // pointer that arrives mid-entrance does not fight it for `translateY`.
    <Motion.View dataSet={ENTRANCE_MARKER} style={[styles.fill, revealStyle]}>
      <Motion.View
        onPointerEnter={handlers.onHoverIn}
        onPointerLeave={handlers.onHoverOut}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        style={[styles.fill, { shadowColor: theme.colors.shadow }, liftStyle, shadowStyle]}
      >
        <Card variant="outlined" style={[styles.card, borderStyle]}>
          {preview ? (
            <Card.Media height={PREVIEW_HEIGHT}>
              <CardPreview kind={preview} />
            </Card.Media>
          ) : null}
          <Column p="lg" gap="md" flex={1}>
            <Row align="center" gap="md">
              {mark ? (
                // A brand mark carries its own colours, so it gets no themed
                // container behind it — a tint would fight the mark's palette.
                // 38px matches the icon badge below (22px icon + `sm` padding),
                // so both card types keep the same title-row height.
                <Motion.View style={markStyle}>
                  <BrandMark uri={mark} size={38} label={`${name} logo`} />
                </Motion.View>
              ) : (
                <Box
                  p="sm"
                  style={[styles.iconBadge, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <MaterialCommunityIcons
                    name={icon as never}
                    size={22}
                    color={theme.colors.onPrimaryContainer}
                  />
                </Box>
              )}
              <Typography variant={featured ? 'headlineSmall' : 'titleLarge'}>{name}</Typography>
              {/* The pills wait for the npm registry, so they always arrive
                  after the card. `Presence` gives them an entrance instead of
                  letting them appear in one frame. */}
              <Row align="center" gap="sm" style={styles.tags}>
                <Presence>
                  {ready ? (
                    <Motion.View
                      key="status"
                      dataSet={ENTRANCE_MARKER}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition="pill"
                    >
                      <Box
                        px="sm"
                        py="xs"
                        style={[styles.statusPill, { backgroundColor: statusColors.bg }]}
                      >
                        <Typography variant="labelSmall" style={{ color: statusColors.fg }}>
                          {status}
                        </Typography>
                      </Box>
                    </Motion.View>
                  ) : null}
                  {ready && version ? (
                    <Motion.View
                      key="version"
                      dataSet={ENTRANCE_MARKER}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition="pill"
                    >
                      <Box
                        px="sm"
                        py="xs"
                        style={[
                          styles.versionPill,
                          {
                            borderColor: theme.colors.outlineVariant,
                            backgroundColor: theme.colors.surfaceContainerLow,
                          },
                        ]}
                      >
                        <Typography
                          variant="labelSmall"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          v{version}
                        </Typography>
                      </Box>
                    </Motion.View>
                  ) : null}
                </Presence>
              </Row>
            </Row>

            <Typography
              variant={featured ? 'bodyLarge' : 'bodyMedium'}
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {description}
            </Typography>

            {meta ? (
              <Typography variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {meta}
              </Typography>
            ) : null}

            <Row align="center" gap="sm" wrap style={styles.footer}>
              {demoUrl ? (
                <Button
                  variant="tonal"
                  trailingIcon="open-in-new"
                  onPress={() => Linking.openURL(demoUrl)}
                >
                  Demo
                </Button>
              ) : null}
              <Button
                variant="outlined"
                leadingIcon="github"
                onPress={() => Linking.openURL(githubUrl)}
              >
                GitHub
              </Button>
            </Row>
          </Column>
        </Card>
      </Motion.View>
    </Motion.View>
  )
}

const styles = StyleSheet.create({
  // The reveal and hover wrappers sit between the grid cell and the card, so
  // both have to pass the cell height through for cards of equal height.
  fill: {
    flex: 1,
  },
  card: {
    flex: 1,
    // The media region is edge to edge, so the card has to clip it to its own
    // corner radius.
    overflow: 'hidden',
  },
  iconBadge: {
    borderRadius: 12,
  },
  tags: {
    marginLeft: 'auto',
  },
  versionPill: {
    borderRadius: 999,
    borderWidth: 1,
  },
  description: {
    flexGrow: 1,
  },
  statusPill: {
    borderRadius: 999,
  },
  footer: {
    marginTop: 'auto',
  },
})
