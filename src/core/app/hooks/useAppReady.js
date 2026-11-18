/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states', 'facts']
 * INFO: App readiness: init, settings, workspace and theme loaded — the shell gate.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import { useSettings, useTheme } from '../../settings'
import { useWorkspace } from '../../workspace'
import store from '../../store'
import { appReadySet } from '../store'
import { AppTauri } from '../tauri'

export function useAppReady() {
  const stored = useSelector(s => s.app.ready)
  const settings = useSettings()
  const theme = useTheme()
  const workspace = useWorkspace()
  const [error, setError] = useState(null)

  console.log(settings)

  useEffectSingle({
    enabled: true,
    callback: async () => {
      setError(null)
      try {
        await AppTauri.init()
        store.dispatch(appReadySet(true))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    ready: stored && settings.ready && theme.ready && workspace.ready,
    error: error ?? settings.error ?? theme.error ?? workspace.error,
  }
}
