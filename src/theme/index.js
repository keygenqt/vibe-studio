/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The theme zone barrel: the accent theme map by name and mode.
 */
import { ThemeDark } from './ThemeDark'
import { ThemeLight } from './ThemeLight'
import { ThemeWaveDark, ThemeWaveLight } from './accents/Wave'
import { ThemeMossDark, ThemeMossLight } from './accents/Moss'
import { ThemeTwilightDark, ThemeTwilightLight } from './accents/Twilight'
import { ThemeSunsetDark, ThemeSunsetLight } from './accents/Sunset'

// The accent theme map: the settings accent name resolves here;
// `default` is the default accent carried by the base themes.
export const THEMES = {
  default: { light: ThemeLight, dark: ThemeDark },
  wave: { light: ThemeWaveLight, dark: ThemeWaveDark },
  moss: { light: ThemeMossLight, dark: ThemeMossDark },
  twilight: { light: ThemeTwilightLight, dark: ThemeTwilightDark },
  sunset: { light: ThemeSunsetLight, dark: ThemeSunsetDark },
}
