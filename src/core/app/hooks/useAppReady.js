/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states', 'facts']
 * INFO: App readiness: the startup mount load and the shell gate flag.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, appReadySet, errorsSet } from '../store'
import { AppTauri } from '../tauri'

export function useAppReady() {
  // the copy read: the startup gate flag
  const ready = useSelector(s => s.app.ready)
  const errors = useSelector(s => s.app.errors)

  // the mount load: the startup command sweeps the progress
  // rows of a killed process and opens the shell gate
  useEffectSingle({
    enabled: !ready,
    callback: () =>
      AppTauri.init()
        .then(() => store.dispatch(appReadySet(true)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.load]: String(error) }))),
  })

  return {
    ready,
    errors,
  }
}
