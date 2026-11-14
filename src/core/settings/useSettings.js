/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Settings read: the mount load and the preferences copy.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../hooks'
import store from '../store'
import { ERRORS, errorsSet, settingsSet } from './store'
import { SettingsTauri } from './tauri'

export function useSettings() {
  // the copy read: the whole preferences slice
  const settings = useSelector(s => s.settings)

  // the mount load: the preferences copy is loaded once
  useEffectSingle({
    enabled: !settings.ready,
    callback: () =>
      SettingsTauri.get()
        .then(value => store.dispatch(settingsSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.load]: String(error) }))),
  })

  return {
    ready: settings.ready,
    errors: settings.errors,
    settings,
  }
}
