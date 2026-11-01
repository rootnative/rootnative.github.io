import { Button, Column, Grid, Row, Typography } from '@rootnative/components'
import { useBreakpointValue, useTheme } from '@rootnative/core'
import { Motion, Stagger } from '@rootnative/inertia'
import { toMetadata, type PageMeta } from '@rootnative/seo'
import { PageHead } from '@rootnative/seo/expo-router'
import { breadcrumbList } from '@rootnative/seo/schema'
import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'

import { Rise } from '../components/rise'
import { AddYourAppCard, ShowcaseCard } from '../components/showcase-card'
import { STAGGER_INTERVAL } from '../lib/motion'
import { SHOWCASE_APPS } from '../lib/showcase-apps'
import { SHARE_CARD, site } from '../lib/site'

const PAGE_META = {
  title: 'Apps built with Root Native',
  description:
    'Apps for iOS, Android and the web that use the Root Native libraries for React Native and Expo. Add your app with a pull request.',
  url: '/showcase',
  ...SHARE_CARD,
} satisfies PageMeta

const JSON_LD = [
  breadcrumbList([
    { name: site.name, url: site.url },
    { name: 'Showcase', url: `${site.url}${PAGE_META.url}` },
  ]),
]

/** See `generateMetadata` in `app/index.tsx`. */
export function generateMetadata() {
  return toMetadata(site, PAGE_META)
}

const GRID_COLUMNS = 12

export default function ShowcaseScreen() {
  const theme = useTheme()
  const titleVariant = useBreakpointValue({
    compact: 'headlineLarge',
    medium: 'displaySmall',
  } as const)
  const span = useBreakpointValue({ compact: 12, expanded: 6 })

  return (
    <>
      <PageHead {...PAGE_META} jsonLd={JSON_LD} />
      {/* A `Motion.ScrollView`, so `useInView` in each card can read the
          scroll offset of the page. */}
      <Motion.ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.scroll}
      >
        <Column gap="xl" px="lg" style={styles.page}>
          {/* The way home is a link, so it takes no fade. */}
          <Row>
            <Link href="/" asChild>
              <Button variant="text" leadingIcon="arrow-left">
                Root Native
              </Button>
            </Link>
          </Row>

          <Column align="center" gap="md">
            <Stagger interval={STAGGER_INTERVAL}>
              <Rise style={styles.stretch} fade={false}>
                <Typography level={1} variant={titleVariant} style={styles.title}>
                  Built with Root Native
                </Typography>
              </Rise>
              <Rise style={styles.stretch} fade={false}>
                <Typography
                  variant="bodyLarge"
                  style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}
                >
                  Apps that use the Root Native libraries. The developer of each app added it with a
                  pull request.
                </Typography>
              </Rise>
            </Stagger>
          </Column>

          <Grid columns={GRID_COLUMNS} gap="md">
            {SHOWCASE_APPS.map((app) => (
              <Grid.Cell key={app.slug} span={span}>
                <ShowcaseCard {...app} />
              </Grid.Cell>
            ))}
            <Grid.Cell span={span}>
              <AddYourAppCard />
            </Grid.Cell>
          </Grid>
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
    paddingTop: 24,
    paddingBottom: 64,
  },
  // An entrance wrapper shrinks to its content under `align="center"`. A block
  // that centres its own text needs the full width instead.
  stretch: {
    alignSelf: 'stretch',
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
})
