import { Box, Button, Chip, Column, Grid, Row, Typography } from '@rootnative/components'
import { useBreakpointValue, useTheme } from '@rootnative/core'
import Head from 'expo-router/head'
import { Linking, ScrollView, StyleSheet, Text } from 'react-native'

import { LibraryCard } from '../components/library-card'
import { LIBRARIES, LINKS } from '../lib/libraries'

export default function HomeScreen() {
  const theme = useTheme()
  const columns = useBreakpointValue({ compact: 1, medium: 2 })
  const titleVariant = useBreakpointValue({
    compact: 'displayMedium',
    medium: 'displayLarge',
  } as const)

  return (
    <>
      <Head>
        <title>rootnative — libraries for React Native & Expo</title>
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
          <Column align="center" gap="lg" style={styles.hero}>
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

            <Typography variant={titleVariant} style={styles.title}>
              <Text style={{ color: theme.colors.primary }}>root</Text>
              <Text style={{ color: theme.colors.onBackground }}>native</Text>
            </Typography>

            <Typography
              variant="bodyLarge"
              style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
            >
              Building libraries that power React Native & Expo apps
            </Typography>

            <Row gap="sm" wrap justify="center">
              <Chip leadingIcon="language-typescript">TypeScript-first</Chip>
              <Chip leadingIcon="license">MIT licensed</Chip>
              <Chip leadingIcon="source-branch">Built in the open</Chip>
            </Row>

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
          </Column>

          <Grid columns={columns} gap="md">
            {LIBRARIES.map((library) => (
              <LibraryCard key={library.name} {...library} />
            ))}
          </Grid>

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
