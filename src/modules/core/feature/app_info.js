/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 */
import { invoke } from '@tauri-apps/api/core'

export const app_info = {
  app_info: async function () {
    return invoke('get_app_info', {})
  },
}
