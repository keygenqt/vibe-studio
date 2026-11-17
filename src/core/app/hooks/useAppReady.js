/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states', 'facts']
 * INFO: App readiness: the startup mount load and the shell gate flag.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { appReadySet } from '../store'
import { AppTauri } from '../tauri'

export function useAppReady() {
  const ready = useSelector(s => s.app.ready)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: !ready,
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
    ready,
    error,
  }
}
