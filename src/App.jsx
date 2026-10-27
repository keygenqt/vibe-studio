/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'states', 'theme', 'hooks']
 */
import { ThemeProvider, Box } from '@mui/material'

import { AppRoute } from './AppRoute'
import { ThemeDark, ThemeLight } from './theme'
import { useEffectFocus, useCoreApp, useCoreWorkspace } from './hooks'
import { DURATION_DEFAULT } from './constants'

function App() {
  const isFocus = useEffectFocus()
  return <ThemedShell isFocus={isFocus} />
}

// the workspace model plus the app model: the persisted choice with
// `system` resolved to the detected OS theme
function ThemedShell(props) {
  const workspace = useCoreWorkspace()
  const { systemTheme } = useCoreApp()
  const themeMode = workspace.themeChoice === 'system' ? systemTheme : workspace.themeChoice

  if (!workspace.ready) return null
  return (
    <ThemeProvider theme={themeMode === 'dark' ? ThemeDark : ThemeLight}>
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
