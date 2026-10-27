/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 */
import { debug } from '@tauri-apps/plugin-log'

import { app, app_events } from './impl/app'
import { providers, providers_events } from './impl/providers'
import { workspace, workspace_events } from './impl/workspace'

// every block binds its own Rust channels; one call for the app
// lifetime — a new block brings its own events
export function bindEvents() {
  return Promise.all([...app_events(), ...providers_events(), ...workspace_events()])
}

export const Methods = {
  ...app,
  ...providers,
  ...workspace,
  // logging to the Rust log (not console.log)
  log: function (message) {
    debug(message)
  },
}
