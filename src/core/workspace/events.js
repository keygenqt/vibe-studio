/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The workspace event: the fresh state lands, an active save keeps its Actual.
 */
import store from '../store'
import { workspaceSet } from './store'
import { WorkspaceTauri } from './tauri'

export function workspaceEvents() {
  return [
    WorkspaceTauri.onState(value => {
      if (store.getState().workspace.workspaceSave === null) {
        store.dispatch(workspaceSet(value))
      }
    }),
  ]
}
