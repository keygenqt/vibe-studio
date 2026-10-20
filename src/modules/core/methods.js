/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 */
import { debug } from '@tauri-apps/plugin-log'
import { invoke } from '@tauri-apps/api/core'

import { app_info } from './feature/app_info'
import { settings } from './feature/settings'
import { workspace } from './feature/workspace'

export const MethodsCore = {
  ...app_info,
  ...settings,
  ...workspace,
  // the state channel — not a feature; snapshot of everything
  state_snapshot: async () => invoke('state_snapshot', {}),
  // logging to the Rust log (not console.log)
  log: function (message) {
    debug(message)
  },
}
