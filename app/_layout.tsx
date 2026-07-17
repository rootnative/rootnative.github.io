import { ThemeProvider } from '@rootnative/core'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { useColorScheme } from '../hooks/use-color-scheme'
import { darkTheme, lightTheme } from '../lib/theme'

export default function RootLayout() {
  const scheme = useColorScheme()

  return (
    <ThemeProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}
