/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'states', 'theme', 'hooks']
 */
import React from 'react'
import { ThemeProvider, Box } from '@mui/material'
import { useSelector } from 'react-redux'

import { AppRoute } from './AppRoute'
import { ThemeDark, ThemeLight } from './theme'
import { useEffectFocus } from './hooks'

function App() {
  // theme comes only from Rust state
  const isReady = useSelector(state => state.appState.ready)
  const themeMode = useSelector(state => state.appState.theme)
  const isFocus = useEffectFocus()

  if (!isReady) return null
  return (
    <ThemeProvider theme={themeMode === 'dark' ? ThemeDark : ThemeLight}>
      <Box
        className={isFocus ? 'WindowFocus' : 'WindowUnfocus'}
        height={1}
        sx={{
          backgroundColor: 'background.default',
        }}
      >
        <AppRoute />
      </Box>
    </ThemeProvider>
  )
}

export default App
