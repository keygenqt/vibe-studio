/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The workspace events: the fresh state and the OS theme land in the copy.
 */
import store from '../store'
import { systemThemeSet, workspaceSet } from './store'
import { WorkspaceTauri } from './tauri'

export function workspaceEvents() {
  return [
    WorkspaceTauri.onState(value => store.dispatch(workspaceSet(value))),
    WorkspaceTauri.onTheme(value => store.dispatch(systemThemeSet(value))),
  ]
}
