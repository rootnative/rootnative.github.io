import { mdiResolver } from '@rootnative/components/mdi'
import { ThemeProvider, useTheme, useThemeMode } from '@rootnative/core'
import { MotionConfig } from '@rootnative/inertia'
import { SeoProvider } from '@rootnative/seo/react'
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { TRANSITIONS } from '../lib/motion'
import { site } from '../lib/site'
import { darkTheme, lightTheme } from '../lib/theme'

const THEMES = { light: lightTheme, dark: darkTheme }

/**
 * Hands React Navigation the colours of the site theme.
 *
 * Expo Router leaves the navigator on React Navigation's `DefaultTheme`, and
 * the native stack paints every screen in that theme's light grey before the
 * screen inside it draws. The first push to a route showed that grey for a
 * frame. With the site colours on the navigator, the screen has the right
 * colour from the first frame.
 */
function NavigationTheme({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const { scheme } = useThemeMode()

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outlineVariant,
      },
    }
  }, [scheme, theme])

  return <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
}

export default function RootLayout() {
  return (
    <ThemeProvider theme={THEMES} iconResolver={mdiResolver}>
      {/* `reducedMotion="user"` is the default. It is written out because this
          site animates on load, and a visitor who asks the OS for less motion
          must get the page with no cascade at all. */}
      <MotionConfig reducedMotion="user" transitions={TRANSITIONS}>
        <SeoProvider site={site}>
          <NavigationTheme>
            {/* `main` renders `<main>` on the web, one per page, around the
                screen. The footer of the home page is the `contentinfo`. */}
            <View role="main" style={styles.main}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </NavigationTheme>
        </SeoProvider>
      </MotionConfig>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
})
