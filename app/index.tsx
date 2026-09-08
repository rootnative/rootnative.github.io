import { Box, Button, Chip, Column, Grid, Row, Typography } from '@rootnative/components'
import { useBreakpointValue, useTheme } from '@rootnative/core'
import { Motion, Stagger } from '@rootnative/inertia'
import Head from 'expo-router/head'
import { Linking, ScrollView, StyleSheet, Text } from 'react-native'

import { BrandMark } from '../components/brand-mark'
import { LibraryCard } from '../components/library-card'
import { Rise } from '../components/rise'
import { MARK_UI } from '../lib/brand-marks'
import { LIBRARIES, LINKS } from '../lib/libraries'
import { CARD_DELAY, CARD_STEP, STAGGER_INTERVAL } from '../lib/motion'
import { useHydrated } from '../lib/use-hydrated'

export default function HomeScreen() {
  const theme = useTheme()
  const hydrated = useHydrated()
  const breakpointColumns = useBreakpointValue({ compact: 1, medium: 2 })
  const breakpointTitleVariant = useBreakpointValue({
    compact: 'displayMedium',
    medium: 'displayLarge',
  } as const)
  const columns = hydrated ? breakpointColumns : 1
  const titleVariant = hydrated ? breakpointTitleVariant : 'displayMedium'

  return (
    <>
      <Head>
        <title>RootNative — libraries that power React Native & Expo apps</title>
        <meta
          name="description"
          content="rootnative builds open-source libraries that power React Native & Expo apps — UI components, animations without the boilerplate, and a lightweight game engine."
        />
      </Head>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.scroll}
      >
        <Column gap="xl" px="lg" style={styles.page}>
          {/* `Stagger` gives each direct child its own delay, so the hero
              cascades in without a single hand-written delay. `Column` passes
              its children straight through, so the `gap` still applies. */}
          <Column align="center" gap="lg" style={styles.hero}>
            <Stagger interval={STAGGER_INTERVAL}>
              <Rise>
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
              </Rise>

              <Rise>
                {/* The mark drifts for as long as the page is open. The outer
                    `Rise` owns the entrance, so the two never share a key. */}
                <Motion.View animate={{ translateY: [0, -8, 0] }} transition="float">
                  <BrandMark uri={MARK_UI} size={72} label="rootnative logo" />
                </Motion.View>
              </Rise>

              <Rise style={styles.stretch}>
                <Typography variant={titleVariant} style={styles.title}>
                  <Text style={{ color: theme.colors.primary }}>root</Text>
                  <Text style={{ color: theme.colors.onBackground }}>native</Text>
                </Typography>
              </Rise>

              <Rise style={styles.stretch}>
                <Typography
                  variant="bodyLarge"
                  style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
                >
                  Building libraries that power React Native & Expo apps
                </Typography>
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

          {/* `Grid` wraps every child in a cell of its own, so a `Stagger`
              here would read as one slot. The cards take an explicit delay. */}
          <Grid columns={columns} gap="md">
            {LIBRARIES.map((library, index) => (
              <LibraryCard key={library.name} delay={CARD_DELAY + index * CARD_STEP} {...library} />
            ))}
          </Grid>

          <Rise delay={CARD_DELAY + LIBRARIES.length * CARD_STEP}>
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
                Everything here is early-stage and evolving fast — ⭐ stars and feedback shape what
                gets built next.
              </Typography>
            </Column>
          </Rise>
        </Column>
      </ScrollView>
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
