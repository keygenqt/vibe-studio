/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'facts']
 * INFO: App facts read: the mount load, the version, debug and OS copy.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { appSet } from '../store'
import { AppTauri } from '../tauri'

export function useInfo() {
  const version = useSelector(s => s.app.version)
  const isDebug = useSelector(s => s.app.isDebug)
  const os = useSelector(s => s.app.os)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: version === null,
    callback: async () => {
      setError(null)
      try {
        const value = await AppTauri.getAppInfo()
        store.dispatch(appSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    version,
    isDebug,
    os,
    error,
  }
}
