/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Settings Tauri commands and its state event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../store'
import { settingsSet, systemThemeSet } from './store'

export const SettingsTauri = {
  get: async function () {
    return invoke('get_settings', {})
  },
  save: async function (settings) {
    return invoke('save_settings', { settings })
  },
  getSystemTheme: async function () {
    return invoke('get_system_theme', {})
  },
  onState: async function () {
    return listen('event-settings', event => {
      // the fresh preferences state saved by a mutation
      if (event.payload.key === 'settings-update') {
        store.dispatch(settingsSet(event.payload.value))
      }
      // the OS theme report from the watcher, fires without any save
      if (event.payload.key === 'theme-change') {
        store.dispatch(systemThemeSet(event.payload.value))
      }
    })
  },
}
