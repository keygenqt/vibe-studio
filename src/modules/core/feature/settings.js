/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'theme']
 */
import { invoke } from '@tauri-apps/api/core'

export const settings = {
  // theme: 'light' | 'dark' | 'system' ('system' = follow the OS)
  settings_set_theme: async function (theme) {
    return invoke('settings_set_theme', { theme })
  },
}
