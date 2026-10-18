/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'theme']
 */
import { invoke } from '@tauri-apps/api/core'

export const settings = {
  state_snapshot: async function () {
    return invoke('state_snapshot', {})
  },
  // theme: 'light' | 'dark' | 'system' ('system' = follow the OS)
  settings_set_theme: async function (theme) {
    return invoke('settings_set_theme', { theme })
  },
}
