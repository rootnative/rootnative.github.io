import { Box, Button, Chip, Column, Grid, Row, Typography } from '@rootnative/components'
import { useBreakpointValue, useTheme } from '@rootnative/core'
import { Motion, Stagger, useInterpolatedStyle, useInView, useScroll } from '@rootnative/inertia'
import Head from 'expo-router/head'
import { useRef } from 'react'
import { Linking, StyleSheet, Text, type View } from 'react-native'

import { BrandMark } from '../components/brand-mark'
import { LibraryCard } from '../components/library-card'
import { Rise } from '../components/rise'
import { ScrollAway } from '../components/scroll-away'
import { MARK_ORG } from '../lib/brand-marks'
import { LIBRARIES, LINKS } from '../lib/libraries'
import { ENTRANCE_MARKER, IN_VIEW, STAGGER_INTERVAL } from '../lib/motion'
import { useScrollAway } from '../lib/use-scroll-away'

/**
 * The card grid is 12 columns wide, and a card takes a span rather than a
 * share of an equal split. `ui` and `inertia` are published, documented, and
 * have a live demo, so they take half a row each; the other three take a
 * third. Five identical cards hid which libraries are ready to use.
 */
const GRID_COLUMNS = 12

/** How far the footer travels on its way in, in points. */
const FOOTER_TRAVEL = 20

/**
 * How far each hero layer drifts up as the page scrolls past it, in points.
 *
 * The four differ on purpose. A layer that drifts further leaves sooner, so
 * the block separates as it goes instead of sliding away as one slab — that
 * separation is the depth cue. The order runs top to bottom, and the amounts
 * fall, so the badge leads and the tagline trails.
 *
 * The chips and the buttons take no drift at all. They are the hero's only
 * interactive rows, and a faded-but-still-clickable button is a worse trade
 * than a row that simply scrolls.
 */
const HERO_DRIFT = { badge: 88, mark: 68, title: 48, tagline: 32 }

/** What the hero mark shrinks to as it leaves. */
const HERO_MARK_SCALE = 0.86

export default function HomeScreen() {
  const theme = useTheme()
  // Rule 2 of the static-export rules. `useBreakpointValue` is hydration-safe
  // from core 0.0.0-alpha.16: it returns the `compact` entry for as long as the
  // client reproduces the server's markup, then the measured one on the
  // re-render React schedules after hydration. This page carried a gate of its
  // own for that until the upgrade.
  const titleVariant = useBreakpointValue({
    compact: 'displayMedium',
    medium: 'displayLarge',
  } as const)
  const featuredSpan = useBreakpointValue({ compact: 12, expanded: 6 })
  const compactSpan = useBreakpointValue({ compact: 12, medium: 6, expanded: 4 })

  // The hero leaves at its own rate rather than riding the scroll, so it needs
  // the scroll position itself. Every block below it answers a yes-or-no —
  // "am I on screen?" — which each one reads for itself through `useInView`.
  // `useScroll` and `useInView` drive the same `Motion.ScrollView`: the hook
  // reads the container's offset off its ref, so the `onScroll` prop stays
  // free for this one.
  const { scrollY, onScroll } = useScroll()
  const { onLayout: onHeroLayout, progress: heroProgress } = useScrollAway(scrollY)

  const footerRef = useRef<View>(null)
  const footerInView = useInView(footerRef, IN_VIEW)
  const footerStyle = useInterpolatedStyle(footerInView, {
    opacity: [0, 1],
    translateY: [FOOTER_TRAVEL, 0],
  })

  return (
    <>
      <Head>
        <title>RootNative — libraries that power React Native & Expo apps</title>
        <meta
          name="description"
          content="rootnative builds open-source libraries that power React Native & Expo apps — UI components, animations without the boilerplate, and a lightweight game engine."
        />
      </Head>
      <Motion.ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Column gap="xl" px="lg" style={styles.page}>
          {/* The hero is the one block that cascades on load, because it is
              the one block a visitor already sees. Everything below it waits
              for the scroll that brings it into view. `Stagger` gives each
              direct child its own delay, and `Column` passes its children
              straight through, so the `gap` still applies. */}
          <Column align="center" gap="lg" style={styles.hero} onLayout={onHeroLayout}>
            <Stagger interval={STAGGER_INTERVAL}>
              <Rise>
                <ScrollAway progress={heroProgress} drift={HERO_DRIFT.badge}>
                  <Box
                    px="md"
                    py="xs"
                    style={[
                      styles.badge,
                      {
                        borderColor: theme.colors.outlineVariant,
                        backgroundColor: theme.colors.surfaceContainerLow,
                      },
                    ]}
                  >
                    <Typography
                      variant="labelSmall"
                      style={[styles.badgeLabel, { color: theme.colors.onSurfaceVariant }]}
                    >
                      OPEN SOURCE · REACT NATIVE TOOLKIT
                    </Typography>
                  </Box>
                </ScrollAway>
              </Rise>

              <Rise>
                {/* Three layers, three owners, and none of them shares a
                    `transform` with another: `Rise` owns the way in,
                    `ScrollAway` owns the way out, and the inner view owns the
                    idle drift that runs for as long as the page is open. */}
                <ScrollAway
                  progress={heroProgress}
                  drift={HERO_DRIFT.mark}
                  scaleTo={HERO_MARK_SCALE}
                >
                  <Motion.View
                    initial={{ translateY: -8 }}
                    animate={{ translateY: 0 }}
                    transition="float"
                  >
                    {/* The organisation's own mark, read from its GitHub org
                        avatar. It is an opaque square, so unlike every library
                        mark it takes a radius — see `BrandMark`. */}
                    <BrandMark uri={MARK_ORG} size={72} radius={18} label="rootnative logo" />
                  </Motion.View>
                </ScrollAway>
              </Rise>

              <Rise style={styles.stretch}>
                <ScrollAway progress={heroProgress} drift={HERO_DRIFT.title} style={styles.stretch}>
                  <Typography variant={titleVariant} style={styles.title}>
                    <Text style={{ color: theme.colors.primary }}>root</Text>
                    <Text style={{ color: theme.colors.onBackground }}>native</Text>
                  </Typography>
                </ScrollAway>
              </Rise>

              <Rise style={styles.stretch}>
                <ScrollAway
                  progress={heroProgress}
                  drift={HERO_DRIFT.tagline}
                  style={styles.stretch}
                >
                  <Typography
                    variant="bodyLarge"
                    style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Animation, UI, gestures, and games — four small libraries you can adopt one at a
                    time.
                  </Typography>
                </ScrollAway>
              </Rise>

              <Rise style={styles.stretch}>
                <Row gap="sm" wrap justify="center">
                  <Chip leadingIcon="language-typescript">TypeScript-first</Chip>
                  <Chip leadingIcon="license">MIT licensed</Chip>
                  <Chip leadingIcon="source-branch">Built in the open</Chip>
                </Row>
              </Rise>

              <Rise style={styles.stretch}>
                <Row gap="sm" wrap justify="center">
                  <Button
                    variant="filled"
                    trailingIcon="arrow-right"
                    onPress={() => Linking.openURL(LINKS.uiDocs)}
                  >
                    Read the ui docs
                  </Button>
                  <Button
                    variant="tonal"
                    leadingIcon="github"
                    onPress={() => Linking.openURL(LINKS.org)}
                  >
                    GitHub
                  </Button>
                </Row>
              </Rise>
            </Stagger>
          </Column>

          <Grid columns={GRID_COLUMNS} gap="md">
            {LIBRARIES.map((library) => (
              <Grid.Cell key={library.name} span={library.featured ? featuredSpan : compactSpan}>
                <LibraryCard {...library} />
              </Grid.Cell>
            ))}
          </Grid>

          {/* No `initial` here — the footer starts hidden because its in-view
              value starts at 0, which the library cannot see. It carries the
              marker by hand. See `ENTRANCE_MARKER`. */}
          <Motion.View
            ref={footerRef}
            dataSet={ENTRANCE_MARKER}
            style={[styles.stretch, footerStyle]}
          >
            <Column align="center" gap="md" style={styles.footer}>
              <Row gap="sm" wrap justify="center">
                <Button variant="text" onPress={() => Linking.openURL(LINKS.uiDocs)}>
                  ui docs
                </Button>
                <Button variant="text" onPress={() => Linking.openURL(LINKS.examples)}>
                  examples
                </Button>
                <Button variant="text" onPress={() => Linking.openURL(LINKS.repositories)}>
                  all repositories
                </Button>
              </Row>
              <Typography
                variant="bodySmall"
                style={[styles.footerNote, { color: theme.colors.onSurfaceVariant }]}
              >
                Early-stage and moving fast. Open an issue or star a repository — that is what sets
                what we build next.
              </Typography>
            </Column>
          </Motion.View>
        </Column>
      </Motion.ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  page: {
    width: '100%',
    maxWidth: 1040,
    marginHorizontal: 'auto',
    paddingBottom: 64,
  },
  hero: {
    paddingTop: 96,
  },
  // An entrance wrapper shrinks to its content under `align="center"`. A block
  // that centres its own text or its own row needs the full width instead.
  stretch: {
    alignSelf: 'stretch',
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeLabel: {
    letterSpacing: 2.5,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  footer: {
    paddingTop: 16,
  },
  footerNote: {
    textAlign: 'center',
  },
})
