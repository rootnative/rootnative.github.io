import { Box, Card, Column, Icon, Row, Typography } from '@rootnative/components'
import { useTheme, useThemeMode } from '@rootnative/core'
import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet } from 'react-native'

import type { ShowcasePlatform } from '../lib/showcase'
import { ADD_APP_URL, builtWith, type BuiltWith, type ShowcaseApp } from '../lib/showcase-apps'
import { LinkButton } from './link-button'
import { Reveal } from './reveal'

const SCREENSHOT_HEIGHT = 280

/** The width / height of a phone screenshot, until the file reports its own size. */
const PHONE_RATIO = 9 / 19.5

const ICON_SIZE = 56
const AVATAR_SIZE = 20

const PLATFORM_LABELS: Record<ShowcasePlatform, string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
}

/** The GitHub avatar of a user or an organisation, at twice the size it is drawn. */
function avatarUrl(author: string) {
  return `https://avatars.githubusercontent.com/${author}?size=${AVATAR_SIZE * 2}`
}

function isGitHub(url: string) {
  return new URL(url).hostname === 'github.com'
}

/**
 * One screenshot at a fixed height. The file is on the host of the app, so its
 * size is known only after it loads: it starts at the shape of a phone screen,
 * which most entries are. A file that fails to load takes no space.
 */
function Screenshot({ uri, alt }: { uri: string; alt: string }) {
  const [ratio, setRatio] = useState(PHONE_RATIO)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let current = true
    Image.getSize(
      uri,
      (width, height) => current && setRatio(width / height),
      () => current && setFailed(true),
    )
    return () => {
      current = false
    }
  }, [uri])

  if (failed) {
    return null
  }
  return (
    <Image
      source={{ uri }}
      accessibilityLabel={alt}
      resizeMode="cover"
      style={[styles.screenshot, { width: SCREENSHOT_HEIGHT * ratio }]}
    />
  )
}

function BuiltWithPill({ name, mark, icon }: BuiltWith) {
  const theme = useTheme()

  return (
    <Box
      px="sm"
      py="xs"
      style={[
        styles.pill,
        {
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surfaceContainerLow,
        },
      ]}
    >
      <Row align="center" gap="xs">
        {mark ? (
          <Image source={{ uri: mark }} style={styles.pillMark} />
        ) : (
          <Icon source={icon} size={16} color={theme.colors.onSurfaceVariant} />
        )}
        <Typography variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {name}
        </Typography>
      </Row>
    </Box>
  )
}

export function ShowcaseCard({
  name,
  tagline,
  author,
  packages,
  platforms,
  links,
  icon,
  screenshots,
}: ShowcaseApp) {
  const theme = useTheme()
  const { scheme } = useThemeMode()
  const muted = { color: theme.colors.onSurfaceVariant }

  return (
    <Reveal style={styles.fill}>
      <Card variant="outlined" style={[styles.card, { borderColor: theme.colors.outlineVariant }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.screenshotBand, { backgroundColor: theme.colors.surfaceContainerLow }]}
          contentContainerStyle={styles.screenshots}
        >
          {screenshots.map(({ url, darkUrl, alt }) => {
            const uri = scheme === 'dark' && darkUrl ? darkUrl : url
            // The key is the file, so a change of scheme loads the new file
            // with a new size and a new error state.
            return <Screenshot key={uri} uri={uri} alt={alt} />
          })}
        </ScrollView>

        <Column p="lg" gap="md" flex={1}>
          <Row align="center" gap="md">
            <Image source={{ uri: icon }} accessibilityLabel={`${name} icon`} style={styles.icon} />
            <Column gap="xs" flex={1}>
              <Typography level={2} variant="headlineSmall">
                {name}
              </Typography>
              <Row align="center" gap="xs">
                <Image source={{ uri: avatarUrl(author) }} style={styles.avatar} />
                <Typography variant="labelLarge" style={muted}>
                  by {author}
                </Typography>
              </Row>
            </Column>
          </Row>

          <Typography variant="bodyLarge" style={[styles.tagline, muted]}>
            {tagline}
          </Typography>

          <Typography variant="labelMedium" style={muted}>
            {platforms.map((platform) => PLATFORM_LABELS[platform]).join(' · ')}
          </Typography>

          <Row align="center" gap="sm" wrap>
            <Typography variant="labelMedium" style={muted}>
              Built with
            </Typography>
            {builtWith(packages).map((library) => (
              <BuiltWithPill key={library.name} {...library} />
            ))}
          </Row>

          <Row align="center" gap="sm" wrap style={styles.footer}>
            {links.web ? (
              <LinkButton href={links.web} variant="tonal" trailingIcon="open-in-new">
                Open the web app
              </LinkButton>
            ) : null}
            {links.appStore ? (
              <LinkButton href={links.appStore} variant="outlined" leadingIcon="apple">
                App Store
              </LinkButton>
            ) : null}
            {links.playStore ? (
              <LinkButton href={links.playStore} variant="outlined" leadingIcon="google-play">
                Google Play
              </LinkButton>
            ) : null}
            {links.expoGo ? (
              <LinkButton href={links.expoGo} variant="outlined" leadingIcon="cellphone">
                Open in Expo Go
              </LinkButton>
            ) : null}
            {links.source ? (
              <LinkButton
                href={links.source}
                variant="outlined"
                leadingIcon={isGitHub(links.source) ? 'github' : 'source-branch'}
              >
                Source
              </LinkButton>
            ) : null}
          </Row>
        </Column>
      </Card>
    </Reveal>
  )
}

/** The last card of the showcase: how a developer adds an app. */
export function AddYourAppCard() {
  const theme = useTheme()

  return (
    <Reveal style={styles.fill}>
      <Card
        variant="outlined"
        style={[styles.card, styles.addCard, { borderColor: theme.colors.outline }]}
      >
        <Column p="lg" gap="md" flex={1} align="center" justify="center">
          <Box
            p="sm"
            style={[styles.iconBadge, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <Icon source="plus" size={22} color={theme.colors.onPrimaryContainer} />
          </Box>
          <Typography level={2} variant="headlineSmall" style={styles.centered}>
            Your app here
          </Typography>
          <Typography
            variant="bodyLarge"
            style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}
          >
            Did you build an app with Root Native? Add it to this page with a pull request that adds
            one file.
          </Typography>
          <LinkButton href={ADD_APP_URL} variant="tonal" leadingIcon="github">
            Add your app
          </LinkButton>
        </Column>
      </Card>
    </Reveal>
  )
}

const styles = StyleSheet.create({
  // The reveal wrapper sits between the grid cell and the card, so it has to
  // pass the cell height through for cards of equal height.
  fill: {
    flex: 1,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  addCard: {
    borderStyle: 'dashed',
  },
  // A `ScrollView` grows and shrinks by default. The text column below has a
  // flex basis of 0, so the band took half of the spare height of the card,
  // and the column lost its last rows. These keys keep the band at the height
  // of its screenshots.
  screenshotBand: {
    flexGrow: 0,
    flexShrink: 0,
  },
  screenshots: {
    gap: 12,
    padding: 16,
  },
  screenshot: {
    height: SCREENSHOT_HEIGHT,
    borderRadius: 12,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  tagline: {
    flexGrow: 1,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
  },
  pillMark: {
    width: 16,
    height: 16,
  },
  iconBadge: {
    borderRadius: 12,
  },
  centered: {
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
  },
})
