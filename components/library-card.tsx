import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Box, Button, Card, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import { Motion, Presence } from '@rootnative/inertia'
import { Linking, StyleSheet } from 'react-native'

import { statusFromVersion, type Library } from '../lib/libraries'
import { ENTRANCE_MARKER } from '../lib/motion'
import { useNpmVersion } from '../lib/use-npm-version'
import { BrandMark } from './brand-mark'
import { Rise } from './rise'

interface LibraryCardProps extends Library {
  /** Milliseconds to wait before the card enters. `app/index.tsx` sets it. */
  delay?: number
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
  delay,
}: LibraryCardProps) {
  const theme = useTheme()
  const { version, ready } = useNpmVersion(npmPackage)
  // Derive status from the published version, falling back to the static one.
  const status = npmPackage ? statusFromVersion(version) : fallbackStatus

  // One container role per status, most-released first.
  const statusColors = {
    stable: { bg: theme.colors.primaryContainer, fg: theme.colors.onPrimaryContainer },
    beta: { bg: theme.colors.tertiaryContainer, fg: theme.colors.onTertiaryContainer },
    alpha: { bg: theme.colors.secondaryContainer, fg: theme.colors.onSecondaryContainer },
    experimental: { bg: theme.colors.surfaceVariant, fg: theme.colors.onSurfaceVariant },
    'in the lab': { bg: theme.colors.surfaceVariant, fg: theme.colors.onSurfaceVariant },
  }[status]

  return (
    <Rise delay={delay} style={styles.fill}>
      {/* The lift is a layer of its own, so a pointer that arrives during the
          entrance does not fight the entrance for `translateY`. `hovered` is
          a no-op on native, which is what this site wants: the web build is
          the only one that ships. */}
      <Motion.View
        style={styles.fill}
        gesture={{ hovered: { translateY: -6, scale: 1.01 } }}
        transition="lift"
      >
        <Card variant="outlined" style={styles.card}>
          <Column p="lg" gap="md" flex={1}>
            <Row align="center" gap="md">
              {mark ? (
                // A brand mark carries its own colours, so it gets no themed
                // container behind it — a tint would fight the mark's palette.
                // 38px matches the icon badge below (22px icon + `sm` padding),
                // so both card types keep the same title-row height.
                <BrandMark uri={mark} size={38} label={`${name} logo`} />
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
              <Typography variant="titleLarge">{name}</Typography>
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
              variant="bodyMedium"
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
    </Rise>
  )
}

const styles = StyleSheet.create({
  // The entrance and lift wrappers sit between the grid cell and the card, so
  // both have to pass the cell height through for cards of equal height.
  fill: {
    flex: 1,
  },
  card: {
    flex: 1,
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
