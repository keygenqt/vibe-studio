/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme', 'misc']
 * INFO: The direct localStorage access: the bootstrap background cache.
 */
export const AppStorage = {
  // the background painted by index.html before the app loads
  readWindowBackground: function () {
    return localStorage.getItem('window.background')
  },

  writeWindowBackground: function (color) {
    localStorage.setItem('window.background', color)
  },
}
