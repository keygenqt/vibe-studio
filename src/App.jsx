/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'states', 'theme', 'hooks']
 * INFO: The app root: resolves the theme choice (system, dark, light) and hosts the route shell.
 */
import { ThemeProvider } from '@mui/material'

import { AppRoute } from './AppRoute'
import { resolveTheme } from './theme'
import { useEffectFocus } from './hooks'
import { useAppReady, useTheme } from './core'
import { ACCENT_DEFAULT, FONT_DEFAULT } from './constants'
import { AppLayout } from './layouts'

function App() {
  const isFocus = useEffectFocus()
  const { ready } = useAppReady()
  // the persisted choice with `system` resolved to the detected OS theme;
  // the accent and the font pick the theme pair, a stale name falls back to the default
  const { mode, accent, font } = useTheme()
  // the theme resolves only when the startup loads land: the loader
  // phase paints on the default pair until the settings come
  const theme = ready
    ? resolveTheme(accent, mode, font)
    : resolveTheme(ACCENT_DEFAULT, 'light', FONT_DEFAULT)

  return (
    <ThemeProvider theme={theme}>
      <AppLayout ready={ready} isFocus={isFocus}>
        <AppRoute />
      </AppLayout>
    </ThemeProvider>
  )
}

export default App
