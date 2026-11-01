/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The twilight accent themes: the purple palette pair.
 */
import { createTheme } from '@mui/material/styles'
import { paletteLight } from '../elements/paletteLight'
import { paletteDark } from '../elements/paletteDark'
import { typography } from '../elements/typography'
import { transitions } from '../elements/transitions'
import { components } from '../elements/components'
import { layout } from '../elements/layout'

export const ThemeTwilightLight = createTheme({
  palette: {
    mode: 'light',
    ...paletteLight,
    primary: { main: '#8b48d6', contrastText: '#fff' },
    secondary: { main: '#6b2fb0', light: '#e9def7', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})

export const ThemeTwilightDark = createTheme({
  palette: {
    mode: 'dark',
    ...paletteDark,
    primary: { main: '#a86ee8', contrastText: '#241038' },
    secondary: { main: '#7a3fc4', light: '#32224a', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})
