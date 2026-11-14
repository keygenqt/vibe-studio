/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'facts']
 * INFO: App read: the mount load and the facts copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../hooks'
import store from '../store'
import { ERRORS, appReadySet, appSet, errorsSet, systemThemeSet } from './store'
import { AppTauri } from './tauri'

export function useApp() {
  // the copy read: the whole facts slice, the fields are mapped on return
  const raw = useSelector(s => s.app)

  // the mount load: the startup order sweeps the progress rows of a killed process
  useEffectSingle({
    enabled: !raw.ready,
    callback: async () => {
      try {
        await AppTauri.init()
        const [info, theme] = await Promise.all([AppTauri.getAppInfo(), AppTauri.getSystemTheme()])
        store.dispatch(appSet(info))
        store.dispatch(systemThemeSet(theme))
        store.dispatch(appReadySet(true))
      } catch (error) {
        store.dispatch(errorsSet({ [ERRORS.load]: String(error) }))
      }
    },
  })

  return {
    ready: raw.ready,
    errors: raw.errors,
    version: raw.version,
    isDebug: raw.isDebug,
    formSuccess: raw.formSuccess,
    systemTheme: raw.systemTheme,
  }
}
