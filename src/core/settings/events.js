/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The settings events: the fresh state and the OS theme land in the copy.
 */
import store from '../store'
import { settingsSet, systemThemeSet } from './store'
import { SettingsTauri } from './tauri'

export function settingsEvents() {
  return [
    SettingsTauri.onState(value => store.dispatch(settingsSet(value))),
    SettingsTauri.onTheme(value => store.dispatch(systemThemeSet(value))),
  ]
}
