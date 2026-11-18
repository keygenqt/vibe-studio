/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace Tauri commands and its state channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../store'
import { workspaceSet } from './store'

export const WorkspaceTauri = {
  get: async function () {
    return invoke('get_workspace', {})
  },
  save: async function (workspace) {
    return invoke('save_workspace', { workspace })
  },
  onState: async function () {
    return listen('event-workspace', event => {
      // the key guards the payload: only the block's own event lands in the copy
      if (event.payload.key === 'workspace-update') {
        store.dispatch(workspaceSet(event.payload.value))
      }
    })
  },
}
