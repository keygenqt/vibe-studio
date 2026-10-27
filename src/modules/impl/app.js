/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { appSet, systemThemeSet } from '../../store/impl/app'

export const app = {
  get_app_info: async function () {
    const info = await invoke('get_app_info', {})
    store.dispatch(appSet(info))
    return info
  },
}

// the block's Rust channel, bound once for the app lifetime: the OS
// theme watcher reports the current theme
export function app_events() {
  return [
    listen('event-app', event => {
      // keep the theme lowercase whatever the wire variant shape is
      store.dispatch(systemThemeSet(String(event.payload.value).toLowerCase()))
    }),
  ]
}
