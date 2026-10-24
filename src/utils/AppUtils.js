/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 */

export const AppUtils = {
  // 'qwen2.5-coder:7b-instruct' -> 'Qwen2.5 Coder 7b Instruct'
  formatModelName: function (model) {
    return model
      .split(/[:\-_/]/)
      .filter(Boolean)
      .map(word => word.replace(/^\p{L}/u, ch => ch.toUpperCase()))
      .join(' ')
  },
}
