/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { invoke } from '@tauri-apps/api/core'

export const sidebar = {
  sidebar_get: async function () {
    return invoke('sidebar_get', {})
  },
  // width is clamped on the Rust side; returns the clamped value
  sidebar_set: async function (collapsed, width) {
    return invoke('sidebar_set', { collapsed, width })
  },
}
