/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The theme zone barrel: the accent colors and the theme factory.
 */
import { createTheme } from '@mui/material/styles'

import { paletteDark } from './elements/paletteDark'
import { paletteLight } from './elements/paletteLight'
import { typography } from './elements/typography'
import { transitions } from './elements/transitions'
import { components } from './elements/components'
import { layout } from './elements/layout'
import { FONT_STACKS } from './elements/fonts'
import { DefaultColors } from './accents/Default'
import { WaveColors } from './accents/Wave'
import { MossColors } from './accents/Moss'
import { TwilightColors } from './accents/Twilight'
import { SunsetColors } from './accents/Sunset'

export { FONT_STACKS }

// The accent color tables by name; `default` is the base teal pair.
export const ACCENT_COLORS = {
  default: DefaultColors,
  wave: WaveColors,
  moss: MossColors,
  twilight: TwilightColors,
  sunset: SunsetColors,
}

// Resolved themes: each pair is built once, the identity stays stable across renders.
const CACHE = new Map()

// The theme factory: shared elements merge over the accent colors, the
// font stack goes through the typography overload into every variant.
export function resolveTheme(accent, mode, font) {
  // a stale stored name falls back to the default accent or stack
  if (!ACCENT_COLORS[accent]) accent = 'default'
  if (!FONT_STACKS[font]) font = 'default'
  const key = `${accent}|${mode}|${font}`
  if (!CACHE.has(key)) {
    CACHE.set(
      key,
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? paletteDark : paletteLight),
          ...ACCENT_COLORS[accent][mode],
        },
        typography: typography(FONT_STACKS[font]),
        transitions,
        components,
        layout,
      })
    )
  }
  return CACHE.get(key)
}
