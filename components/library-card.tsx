import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Box, Button, Card, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import { Linking, StyleSheet } from 'react-native'

import { statusFromVersion, type Library } from '../lib/libraries'
import { useNpmVersion } from '../lib/use-npm-version'
import { BrandMark } from './brand-mark'

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
}: Library) {
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
          {ready ? (
            <Row align="center" gap="sm" style={styles.tags}>
              <Box
                px="sm"
                py="xs"
                style={[styles.statusPill, { backgroundColor: statusColors.bg }]}
              >
                <Typography variant="labelSmall" style={{ color: statusColors.fg }}>
                  {status}
                </Typography>
              </Box>
              {version ? (
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
                  <Typography variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    v{version}
                  </Typography>
                </Box>
              ) : null}
            </Row>
          ) : null}
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
  )
}

const styles = StyleSheet.create({
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
