/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 */
import { createTheme } from '@mui/material/styles'
import { typography } from './elements/typography'
import { components } from './elements/components'
import { DURATION_AUTO_HIDE, DURATION_DEFAULT } from '../constants/AppDefault'

export const ThemeDark = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#333333', paper: '#1e1e1e' },
    primary: { main: '#2dd4bf', contrastText: '#0f2a2c' },
    secondary: { main: '#14b8a6', contrastText: '#fff' },
    success: { main: '#23a076' },
    error: { main: '#ef5350' },
    inherit: { main: '#f7f7f7', light: '#4a4a55' },
    panel: { main: 'rgba(255, 255, 255, 0.03)' },
  },
  transitions: {
    duration: { standard: DURATION_DEFAULT, autoHide: DURATION_AUTO_HIDE },
  },
  typography: typography,
  components: components,
})
