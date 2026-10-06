import { Button, Column, Row, Typography } from '@rootnative/components'
import { useTheme } from '@rootnative/core'
import { PageHead } from '@rootnative/seo/expo-router'
import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function NotFoundScreen() {
  const theme = useTheme()

  return (
    <>
      {/* GitHub Pages serves this page as `404.html` at every unknown path, so
          it has no canonical URL. No `url` means no canonical link and no share
          card. */}
      <PageHead title="Page not found — RootNative" noindex />
      <Column
        align="center"
        justify="center"
        gap="md"
        px="lg"
        style={[styles.page, { backgroundColor: theme.colors.background }]}
      >
        <Typography level={1} variant="headlineMedium" style={styles.text}>
          Page not found
        </Typography>
        <Typography
          variant="bodyLarge"
          style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
        >
          This address has no page. The libraries and their docs start from the home page.
        </Typography>
        {/* `Button` sets `alignSelf: 'flex-start'` on its own wrapper, which wins
            over the column's `align="center"`. A row centres it. */}
        <Row justify="center">
          <Link href="/" replace asChild>
            <Button variant="filled" leadingIcon="arrow-left">
              Back to rootnative
            </Button>
          </Link>
        </Row>
      </Column>
    </>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
})
