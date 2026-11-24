/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace writes: the merged shell save.
 */
import store from '../store'
import { workspaceSet } from './store'
import { WorkspaceTauri } from './tauri'

export const WorkspaceMethod = {
  save: function (values = {}) {
    const next = { ...store.getState().workspace, ...values }
    store.dispatch(workspaceSet(next))
    return WorkspaceTauri.save(next)
  },
}
