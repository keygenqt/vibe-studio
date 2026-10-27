/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 */
import { debug } from '@tauri-apps/plugin-log'

import { app, app_events } from './impl/app'
import { groups_chat, groups_chat_events } from './impl/groups_chat'
import { providers, providers_events } from './impl/providers'
import { workspace, workspace_events } from './impl/workspace'

// every block binds its own Rust channels; one call for the app
// lifetime — a new block brings its own events
export function bindEvents() {
  return Promise.all([
    ...app_events(),
    ...providers_events(),
    ...groups_chat_events(),
    ...workspace_events(),
  ])
}

// the single JS surface to Rust: one method — one command, a block
// brings its own methods into the spread
export const Methods = {
  ...app,
  ...providers,
  ...groups_chat,
  ...workspace,
  // logging to the Rust log (not console.log)
  log: function (message) {
    debug(message)
  },
}
