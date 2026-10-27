/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { workspaceSet } from '../../store/impl/workspace'

export const workspace = {
  get_workspace: async function () {
    const answer = await invoke('get_workspace', {})
    store.dispatch(workspaceSet(answer))
    return answer
  },
  // one command for every mutation: the whole struct is the wire unit;
  // the event-workspace broadcast writes the fresh row to the store
  save_workspace: async function (workspace) {
    return invoke('save_workspace', { workspace })
  },
}

// the block's Rust channel, bound once for the app lifetime: every
// workspace mutation ends with the fresh stored row
export function workspace_events() {
  return [
    listen('event-workspace', event => {
      store.dispatch(workspaceSet(event.payload.value))
    }),
  ]
}
