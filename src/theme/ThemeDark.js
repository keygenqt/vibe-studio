/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The dark MUI theme: palette, typography, transitions, components.
 */
import { createTheme } from '@mui/material/styles'
import { paletteDark } from './elements/paletteDark'
import { typography } from './elements/typography'
import { transitions } from './elements/transitions'
import { components } from './elements/components'
import { layout } from './elements/layout'

export const ThemeDark = createTheme({
  palette: {
    mode: 'dark',
    ...paletteDark,
    primary: { main: '#2dd4bf', contrastText: '#0f2a2c' },
    secondary: { main: '#14b8a6', light: '#22423c', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})
