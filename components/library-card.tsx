import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Box, Button, Card, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import {
  Motion,
  Presence,
  type ShadowConfig,
  useColorTransition,
  useGesture,
  useInterpolatedStyle,
  useInView,
  useShadow,
  useTransform,
} from '@rootnative/inertia'
import { useMemo, useRef } from 'react'
import { Linking, Platform, StyleSheet, type View } from 'react-native'

import { statusFromVersion, type Library } from '../lib/libraries'
import { ENTRANCE_MARKER, IN_VIEW } from '../lib/motion'
import { useNpmVersion } from '../lib/use-npm-version'
import { BrandMark } from './brand-mark'
import { CardPreview } from './card-preview'

/** How far a card travels on its way in, in points. */
const REVEAL_TRAVEL = 28

/** Height of a card's live preview region, in points. */
const PREVIEW_HEIGHT = 128

/** `#rrggbb` and an alpha, as the `rgba()` string `useShadow` interpolates. */
function withAlpha(hex: string, alpha: number) {
  const value = parseInt(hex.slice(1), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

/**
 * The resting and hovered shadow of a card, one surface per platform.
 *
 * Web takes `boxShadow`, not the classic `shadow*` keys. react-native-web 0.21
 * deprecated those keys, and Reanimated does not turn their animated values into
 * CSS, so the hovered shadow stayed fully transparent on the one renderer this
 * site deploys.
 *
 * Native takes the `shadow*` keys and `elevation`. **The two surfaces must not
 * meet on one config.** React Native 0.76 and later on the new architecture —
 * the default on the 0.86 pinned here — renders `boxShadow` natively as well, so
 * a config that carries both paints two shadows on one view, and whichever the
 * view resolves last wins. `@rootnative/components` `0.0.0-alpha.16` documents
 * this and exports `elevationShadowConfig`, which makes the same split from a
 * `theme.elevation.level*` token. This card keeps its own values, because the
 * hover lift is taller and softer than any one token level.
 *
 * The native blur is half the web one: `blurRadius` is a CSS blur diameter and
 * `shadowRadius` is the standard deviation behind it.
 */
function shadowPair(shadowColor: string): { rest: ShadowConfig; hover: ShadowConfig } {
  if (Platform.OS === 'web') {
    return {
      rest: {
        boxShadow: [{ offsetX: 0, offsetY: 0, blurRadius: 0, color: withAlpha(shadowColor, 0) }],
      },
      hover: {
        boxShadow: [
          { offsetX: 0, offsetY: 12, blurRadius: 20, color: withAlpha(shadowColor, 0.18) },
        ],
      },
    }
  }

  return {
    rest: {
      shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    hover: {
      shadowColor,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 10,
      shadowOpacity: 0.18,
      elevation: 8,
    },
  }
}

type LibraryCardProps = Library

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
}: LibraryCardProps) {
  const theme = useTheme()
  const { version, ready } = useNpmVersion(npmPackage)
  // Derive status from the published version, falling back to the static one.
  const status = npmPackage ? statusFromVersion(version) : fallbackStatus

  // The entrance. It starts when the card arrives on screen, not on a delay
  // counted from page load, so a card below the fold still enters where the
  // visitor sees it. The card holds its own ref and answers for itself —
  // `useInView` needs nothing from the page.
  const cardRef = useRef<View>(null)
  const inView = useInView(cardRef, IN_VIEW)
  const revealStyle = useInterpolatedStyle(inView, {
    opacity: [0, 1],
    translateY: [REVEAL_TRAVEL, 0],
  })

  // One gesture, four animated targets. `useGesture` exists for exactly this:
  // the `gesture` prop animates only the element that carries it, and the
  // lift, the shadow, the border, and the mark are four different elements.
  //
  // `pointerHandlers` is the bag keyed for a plain `View`
  // (`onPointerEnter` / `onPointerLeave` / `onFocus` / `onBlur`), which is what
  // this surface is: a card with no action of its own. The `Pressable` bag
  // would cost five dead keyboard stops — react-native-web renders
  // `tabindex="0"` on a `Pressable` even with `focusable={false}` and
  // `accessible={false}`. Both bags hold the same callbacks by reference, so
  // they cannot drift apart. New in inertia 0.0.12; this was four hand-mapped
  // props before.
  const { hovered, focused, pointerHandlers } = useGesture('hover')
  // Focus counts as well as hover, so a visitor who tabs to a button inside
  // the card gets the same highlight a pointer gets. DOM focus bubbles, so
  // the wrapper sees a child's focus without being focusable itself.
  const active = useTransform(() => {
    'worklet'
    return Math.max(hovered.value, focused.value)
  })
  const liftStyle = useInterpolatedStyle(active, { translateY: [0, -6], scale: [1, 1.012] })
  const shadow = useMemo(() => shadowPair(theme.colors.shadow), [theme.colors.shadow])
  const shadowStyle = useShadow({ from: shadow.rest, to: shadow.hover, progress: active })
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
    //
    // No `initial` on the outer view — the card starts hidden because its
    // in-view value starts at 0, which the library cannot see. It carries the
    // marker by hand. See `ENTRANCE_MARKER`.
    <Motion.View ref={cardRef} dataSet={ENTRANCE_MARKER} style={[styles.fill, revealStyle]}>
      <Motion.View {...pointerHandlers} style={[styles.fill, liftStyle, shadowStyle]}>
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
