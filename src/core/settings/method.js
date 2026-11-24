/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Settings writes: the merged preferences save.
 */
import store from '../store'
import { settingsSet } from './store'
import { SettingsTauri } from './tauri'

export const SettingsMethod = {
  save: function (values = {}) {
    const next = { ...store.getState().settings, ...values }
    store.dispatch(settingsSet(next))
    return SettingsTauri.save(next)
  },
}
