/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: App commands and the OS theme event channel.
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
  get_system_theme: async function () {
    const theme = await invoke('get_system_theme', {})
    store.dispatch(systemThemeSet(theme))
    return theme
  },
}

// the block's Rust channel, bound once for the app lifetime: the OS
// theme watcher reports the current theme
export function app_events() {
  return [
    listen('event-app', event => {
      store.dispatch(systemThemeSet(String(event.payload.value).toLowerCase()))
    }),
  ]
}
