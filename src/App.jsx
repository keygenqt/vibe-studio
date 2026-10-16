/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import React from 'react'
import { ThemeProvider, Box } from '@mui/material'
import { useSelector } from 'react-redux'

import { AppRoute } from './AppRoute'
import { ThemeLight } from './theme/ThemeLight'
import { ThemeDark } from './theme/ThemeDark'
import { useEffectFocus, useEffectStateSync } from './base'

function App() {
  // theme comes only from Rust state
  const isReady = useSelector(state => state.appState.ready)
  const themeMode = useSelector(state => state.appState.theme)
  const isFocus = useEffectFocus()
  useEffectStateSync()
  if (!isReady) return null
  return (
    <ThemeProvider theme={themeMode === 'dark' ? ThemeDark : ThemeLight}>
      <Box
        className={'MainBox ' + (isFocus ? 'WindowFocus' : 'WindowUnfocus')}
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
