import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Box, Button, Card, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import { Linking, StyleSheet } from 'react-native'

import type { Library } from '../lib/libraries'

export function LibraryCard({
  name,
  icon,
  description,
  status,
  meta,
  githubUrl,
  demoUrl,
}: Library) {
  const theme = useTheme()

  const statusColors =
    status === 'alpha'
      ? { bg: theme.colors.tertiaryContainer, fg: theme.colors.onTertiaryContainer }
      : status === 'experimental'
        ? { bg: theme.colors.secondaryContainer, fg: theme.colors.onSecondaryContainer }
        : { bg: theme.colors.surfaceVariant, fg: theme.colors.onSurfaceVariant }

  return (
    <Card variant="outlined" style={styles.card}>
      <Column p="lg" gap="md" flex={1}>
        <Row align="center" gap="md">
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
          <Typography variant="titleLarge">{name}</Typography>
        </Row>

        <Typography
          variant="bodyMedium"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Typography>

        <Row align="center" gap="sm" wrap>
          <Box px="sm" py="xs" style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
            <Typography variant="labelSmall" style={{ color: statusColors.fg }}>
              {status}
            </Typography>
          </Box>
          {meta ? (
            <Typography variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {meta}
            </Typography>
          ) : null}
        </Row>

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
