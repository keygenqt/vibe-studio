/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'facts']
 * INFO: App facts read: the mount load, the version and debug copy.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, appSet, errorsSet } from '../store'
import { AppTauri } from '../tauri'

export function useInfo() {
  // the copy read: the facts of the running app
  const version = useSelector(s => s.app.version)
  const isDebug = useSelector(s => s.app.isDebug)
  const errors = useSelector(s => s.app.errors)

  // the mount load: the facts copy is loaded once
  useEffectSingle({
    enabled: version === null,
    callback: () =>
      AppTauri.getAppInfo()
        .then(value => store.dispatch(appSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.load]: String(error) }))),
  })

  return {
    version,
    isDebug,
    errors,
  }
}
