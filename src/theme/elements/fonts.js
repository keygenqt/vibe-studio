/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The app font stacks by the settings font name.
 */
import { FONT_FAMILY_DEFAULT } from './typography'

export const FONT_STACKS = {
  default: FONT_FAMILY_DEFAULT,
  arimo: ['Arimo', 'Ubuntu', 'Segoe UI', 'sans-serif'].join(','),
  montserrat: ['Montserrat', 'Ubuntu', 'Segoe UI', 'sans-serif'].join(','),
  nunito: ['Nunito', 'Ubuntu', 'Segoe UI', 'sans-serif'].join(','),
  rubik: ['Rubik', 'Ubuntu', 'Segoe UI', 'sans-serif'].join(','),
}
