/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 * INFO: The app event: the OS theme lands in the copy.
 */
import store from '../store'
import { systemThemeSet } from './store'
import { AppTauri } from './tauri'

export function appEvents() {
  return [AppTauri.onTheme(value => store.dispatch(systemThemeSet(value)))]
}
