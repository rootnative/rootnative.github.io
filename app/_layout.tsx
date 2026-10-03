import { mdiResolver } from '@rootnative/components/mdi'
import { ThemeProvider } from '@rootnative/core'
import { MotionConfig } from '@rootnative/inertia'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { ThemeReadySignal } from '../components/theme-ready-signal'
import { TRANSITIONS } from '../lib/motion'
import { darkTheme, lightTheme } from '../lib/theme'

const THEMES = { light: lightTheme, dark: darkTheme }

export default function RootLayout() {
  return (
    <ThemeProvider theme={THEMES} iconResolver={mdiResolver}>
      <ThemeReadySignal />
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
