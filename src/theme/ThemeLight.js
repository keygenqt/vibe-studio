/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 */
import { createTheme } from '@mui/material/styles'
import { typography } from './elements/typography'
import { transitions } from './elements/transitions'
import { components } from './elements/components'

export const ThemeLight = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#dddddd', paper: '#f9fbfa' },
    primary: { main: '#0d9488', contrastText: '#fff' },
    secondary: { main: '#115e59', contrastText: '#fff' },
    success: { main: '#1e8e67' },
    error: { main: '#d32f2f' },
    inherit: { main: '#1f1f29', light: '#dcd9ec' },
    panel: { main: 'rgba(0, 0, 0, 0.04)' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
})
