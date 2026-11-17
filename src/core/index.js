/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The core runtime wiring: the store and the Rust event binding.
 */
import { chatEvents } from './chat'
import { groupsChatEvents } from './groupsChat'
import { providersEvents } from './providers'
import { settingsEvents } from './settings'
import { workspaceEvents } from './workspace'

export { default as store } from './store'

// one call for the app lifetime; each block contributes its own channels
export function bindEvents() {
  return Promise.all([
    ...chatEvents(),
    ...providersEvents(),
    ...groupsChatEvents(),
    ...settingsEvents(),
    ...workspaceEvents(),
  ])
}
