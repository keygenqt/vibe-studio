/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The light MUI theme: palette, typography, transitions, components.
 */
import { createTheme } from '@mui/material/styles'
import { paletteLight } from './elements/paletteLight'
import { typography } from './elements/typography'
import { transitions } from './elements/transitions'
import { components } from './elements/components'
import { layout } from './elements/layout'

export const ThemeLight = createTheme({
  palette: {
    mode: 'light',
    ...paletteLight,
    primary: { main: '#0d9488', contrastText: '#fff' },
    secondary: { main: '#115e59', light: '#dbe6e3', contrastText: '#fff' },
  },
  typography: typography,
  transitions: transitions,
  components: components,
  layout: layout,
})
