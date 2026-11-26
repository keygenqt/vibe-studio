/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 * INFO: The typography factory of the MUI theme: sizes plus a font stack.
 */

// The base app font family.
export const FONT_FAMILY_DEFAULT = ['Open Sans', 'Ubuntu', 'Segoe UI', 'sans-serif'].join(',')

// The family goes through the overload: MUI bakes it into every typography variant.
export const typography = (fontFamily = FONT_FAMILY_DEFAULT) => ({
  fontSize: 14,
  fontFamily,
  h5: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle2: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
})
