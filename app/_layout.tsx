import { ThemeProvider } from '@rootnative/core'
import { MotionConfig } from '@rootnative/inertia'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { useColorScheme } from '../hooks/use-color-scheme'
import { TRANSITIONS } from '../lib/motion'
import { darkTheme, lightTheme } from '../lib/theme'

export default function RootLayout() {
  const scheme = useColorScheme()

  return (
    <ThemeProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
      {/* `reducedMotion="user"` is the default. It is written out because this
          site animates on load, and a visitor who asks the OS for less motion
          must get the page with no cascade at all. */}
      <MotionConfig reducedMotion="user" transitions={TRANSITIONS}>
        <Stack screenOptions={{ headerShown: false }} />
      </MotionConfig>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}
