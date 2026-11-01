/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The wave accent themes: the blue palette pair.
 */
import { createTheme } from '@mui/material/styles'
import { paletteLight } from '../elements/paletteLight'
import { paletteDark } from '../elements/paletteDark'
import { typography } from '../elements/typography'
import { transitions } from '../elements/transitions'
import { components } from '../elements/components'
import { layout } from '../elements/layout'

export const ThemeWaveLight = createTheme({
  palette: {
    mode: 'light',
    ...paletteLight,
    primary: { main: '#3574e0', contrastText: '#fff' },
    secondary: { main: '#1d4fc4', light: '#d9e4fa', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})

export const ThemeWaveDark = createTheme({
  palette: {
    mode: 'dark',
    ...paletteDark,
    primary: { main: '#5b93ec', contrastText: '#0f2038' },
    secondary: { main: '#2c5fd6', light: '#22355c', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})
