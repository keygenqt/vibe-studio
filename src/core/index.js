/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The core runtime wiring: the store and the Rust event binding.
 */
import { ChatTauri } from './chat/tauri'
import { GroupsChatTauri } from './groupsChat/tauri'
import { ProvidersTauri } from './providers/tauri'
import { SettingsTauri } from './settings/tauri'
import { WorkspaceTauri } from './workspace/tauri'

export { default as store } from './store'

// one call for the app lifetime; each block binds its own channels
export function bindEvents() {
  return Promise.all([
    ChatTauri.onState(),
    ProvidersTauri.onState(),
    GroupsChatTauri.onState(),
    SettingsTauri.onEvent(),
    WorkspaceTauri.onState(),
  ])
}
