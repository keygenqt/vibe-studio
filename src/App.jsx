/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'states', 'theme', 'hooks']
 * INFO: The app root: resolves the theme choice (system, dark, light) and hosts the route shell.
 */
import { ThemeProvider, Box } from '@mui/material'

import { AppRoute } from './AppRoute'
import { THEMES } from './theme'
import { useEffectFocus, useCoreApp, useCoreSettings, useCoreWorkspace } from './hooks'
import { ACCENT_DEFAULT, DURATION_DEFAULT } from './constants'

function App() {
  const isFocus = useEffectFocus()
  return <ThemedShell isFocus={isFocus} />
}

// the workspace and settings models plus the app model: the
// persisted choice with `system` resolved to the detected OS theme
function ThemedShell(props) {
  const workspace = useCoreWorkspace()
  const { settings } = useCoreSettings()
  const { systemTheme } = useCoreApp()
  const themeMode = settings.appearance_theme === 'system' ? systemTheme : settings.appearance_theme
  // the accent picks the theme pair; an unknown or untouched name falls back to the default
  const theme = (THEMES[settings.appearance_accent] ?? THEMES[ACCENT_DEFAULT])[themeMode]

  if (!workspace.ready || !settings.ready) return null
  return (
    <ThemeProvider theme={theme}>
      <Box
        height={1}
        sx={theme => ({
          backgroundColor: 'background.default',
          // bridge for plain CSS: styles.css reads the theme through these vars
          '--app-paper': theme.palette.background.paper,
          '--duration-default': `${DURATION_DEFAULT}ms`,
        })}
      >
        {/* the dim sits on the content: the window background stays solid */}
        <Box className={props.isFocus ? 'WindowFocus' : 'WindowUnfocus'} height={1}>
          <AppRoute />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
