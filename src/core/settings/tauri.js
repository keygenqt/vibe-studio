/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Settings Tauri commands and its state event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export const SettingsTauri = {
  get: async function () {
    return invoke('get_settings', {})
  },
  save: async function (settings) {
    return invoke('save_settings', { settings })
  },
  onState: function (callback) {
    return listen('event-settings', event => {
      callback(event.payload.value)
    })
  },
}
