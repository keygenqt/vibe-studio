/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace Tauri commands and its state event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export const WorkspaceTauri = {
  get: async function () {
    return invoke('get_workspace', {})
  },
  save: async function (workspace) {
    return invoke('save_workspace', { workspace })
  },
  onState: function (callback) {
    return listen('event-workspace', event => {
      callback(event.payload.value)
    })
  },
}
