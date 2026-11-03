/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: App commands and the OS theme event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { appReadySet, appSet, systemThemeSet } from '../../store/impl/app'

export const app = {
  // the startup order: sweeps the progress rows of a killed process
  init: async function () {
    await invoke('init', {})
    store.dispatch(appReadySet(true))
  },
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
  clipboard_write_text: async function (text) {
    return invoke('clipboard_write_text', { text })
  },
  clipboard_write_image: async function (png) {
    return invoke('clipboard_write_image', { png })
  },
  clipboard_write_files: async function (paths) {
    return invoke('clipboard_write_files', { paths })
  },
  clipboard_clear: async function () {
    return invoke('clipboard_clear', {})
  },
  clipboard_read: async function () {
    return invoke('clipboard_read', {})
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
