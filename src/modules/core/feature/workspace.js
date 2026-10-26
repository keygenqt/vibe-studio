/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'

export const workspace = {
  workspace_get: async function () {
    return invoke('get_workspace', {})
  },
  // one command for every mutation: the whole struct is the wire unit,
  // the answer is the stored row (it also comes back over event-state)
  workspace_save: async function (workspace) {
    return invoke('save_workspace', { workspace })
  },
}
