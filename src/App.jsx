/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'states', 'theme', 'hooks']
 */
import React from 'react'
import { ThemeProvider, Box } from '@mui/material'

import { AppRoute } from './AppRoute'
import { ThemeDark, ThemeLight } from './theme'
import { useEffectFocus, useWorkspace, WorkspaceProvider } from './hooks'
import { DURATION_DEFAULT } from './constants/AppDefault'

function App() {
  const isFocus = useEffectFocus()
  return (
    <WorkspaceProvider>
      <ThemedShell isFocus={isFocus} />
    </WorkspaceProvider>
  )
}

// lives inside the provider — reads the workspace from context
function ThemedShell(props) {
  const workspace = useWorkspace()
  // the persisted choice with `system` resolved to the detected OS theme
  const themeMode =
    workspace.themeChoice === 'system' ? workspace.systemTheme : workspace.themeChoice

  if (!workspace.ready) return null
  return (
    <ThemeProvider theme={themeMode === 'dark' ? ThemeDark : ThemeLight}>
      <Box
        className={props.isFocus ? 'WindowFocus' : 'WindowUnfocus'}
        height={1}
        sx={theme => ({
          backgroundColor: 'background.default',
          // bridge for plain CSS: styles.css reads the theme through these vars
          '--app-paper': theme.palette.background.paper,
          '--duration-default': `${DURATION_DEFAULT}ms`,
        })}
      >
        <AppRoute />
      </Box>
    </ThemeProvider>
  )
}

export default App
