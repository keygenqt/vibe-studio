/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Settings block commands and its event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { settingsSet } from '../../store/impl/settings'

export const settings = {
  get_settings: async function () {
    const answer = await invoke('get_settings', {})
    store.dispatch(settingsSet(answer))
    return answer
  },
  save_settings: async function (settings) {
    return invoke('save_settings', { settings })
  },
}

export function settings_events() {
  return [
    listen('event-settings', event => {
      store.dispatch(settingsSet(event.payload.value))
    }),
  ]
}
