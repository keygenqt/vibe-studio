/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 */
import { createTheme } from '@mui/material/styles'
import { palette } from './light/palette'
import { typography } from './elements/typography'
import { components } from './elements/components'

export const ThemeLight = createTheme({
  palette: palette,
  typography: typography,
  components: components,
})
