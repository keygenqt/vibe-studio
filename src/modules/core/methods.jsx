/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { debug } from '@tauri-apps/plugin-log'

import { app_info } from './feature/app_info'
import { settings } from './feature/settings'
import { sidebar } from './feature/sidebar'

export const MethodsCore = {
  ...app_info,
  ...settings,
  ...sidebar,
  log: function (message) {
    debug(message)
  },
}
