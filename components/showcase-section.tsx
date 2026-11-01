import { Button, Card, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import { Link } from 'expo-router'
import { Image, StyleSheet } from 'react-native'

import { SHOWCASE_APPS } from '../lib/showcase-apps'
import { Reveal } from './reveal'

/** The most apps that the home page names. The showcase page has all of them. */
const MAX_APPS = 6

const ICON_SIZE = 56

/** The way from the home page to the showcase: the newest apps, and a link to all of them. */
export function ShowcaseSection() {
  const theme = useTheme()

  return (
    <Reveal>
      <Card variant="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
        <Column align="center" gap="md" p="xl">
          <Typography level={2} variant="headlineSmall" style={styles.centered}>
            Built with Root Native
          </Typography>
          <Typography
            variant="bodyLarge"
            style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}
          >
            Apps that use these libraries. Add your app with a pull request.
          </Typography>
          <Row gap="lg" wrap justify="center">
            {SHOWCASE_APPS.slice(0, MAX_APPS).map(({ slug, name, icon }) => (
              <Column key={slug} align="center" gap="xs">
                {/* The name below the icon is the text, so the icon has no label. */}
                <Image source={{ uri: icon }} style={styles.icon} />
                <Typography variant="labelLarge">{name}</Typography>
              </Column>
            ))}
          </Row>
          <Link href="/showcase" asChild>
            <Button variant="tonal" trailingIcon="arrow-right">
              See the showcase
            </Button>
          </Link>
        </Column>
      </Card>
    </Reveal>
  )
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 14,
  },
})
