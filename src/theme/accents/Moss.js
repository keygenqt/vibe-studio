/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The moss accent themes: the green palette pair.
 */
import { createTheme } from '@mui/material/styles'
import { paletteLight } from '../elements/paletteLight'
import { paletteDark } from '../elements/paletteDark'
import { typography } from '../elements/typography'
import { transitions } from '../elements/transitions'
import { components } from '../elements/components'
import { layout } from '../elements/layout'

export const ThemeMossLight = createTheme({
  palette: {
    mode: 'light',
    ...paletteLight,
    primary: { main: '#2aa47c', contrastText: '#fff' },
    secondary: { main: '#17785a', light: '#d9ede5', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})

export const ThemeMossDark = createTheme({
  palette: {
    mode: 'dark',
    ...paletteDark,
    primary: { main: '#4cc49c', contrastText: '#0f2a20' },
    secondary: { main: '#21906b', light: '#1f3c30', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})
