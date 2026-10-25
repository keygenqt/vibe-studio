/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 */
import { createTheme } from '@mui/material/styles'
import { typography } from './elements/typography'
import { components } from './elements/components'
import {
  DURATION_AUTO_HIDE,
  DURATION_DEFAULT,
  DURATION_PAGE_LOADING,
} from '../constants/AppDefault'

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
  transitions: {
    duration: {
      standard: DURATION_DEFAULT,
      autoHide: DURATION_AUTO_HIDE,
      pageLoading: DURATION_PAGE_LOADING,
    },
  },
  typography: typography,
  components: components,
})
