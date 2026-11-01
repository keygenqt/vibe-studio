/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The sunset accent themes: the orange palette pair.
 */
import { createTheme } from '@mui/material/styles'
import { paletteLight } from '../elements/paletteLight'
import { paletteDark } from '../elements/paletteDark'
import { typography } from '../elements/typography'
import { transitions } from '../elements/transitions'
import { components } from '../elements/components'
import { layout } from '../elements/layout'

export const ThemeSunsetLight = createTheme({
  palette: {
    mode: 'light',
    ...paletteLight,
    primary: { main: '#d2691e', contrastText: '#fff' },
    secondary: { main: '#a84e0f', light: '#f9e4d4', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})

export const ThemeSunsetDark = createTheme({
  palette: {
    mode: 'dark',
    ...paletteDark,
    primary: { main: '#e8893f', contrastText: '#2e1505' },
    secondary: { main: '#c05f16', light: '#3f2312', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})
