/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 */
import { debug } from '@tauri-apps/plugin-log'

import { app_info } from './feature/app_info'
import { settings } from './feature/settings'
import { workspace } from './feature/workspace'

export const MethodsCore = {
  ...app_info,
  ...settings,
  ...workspace,
  log: function (message) {
    debug(message)
  },
}
