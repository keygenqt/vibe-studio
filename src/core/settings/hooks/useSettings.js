/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Settings read: the mount load and the preferences copy.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { settingsSet } from '../store'
import { SettingsTauri } from '../tauri'

export function useSettings() {
  const settings = useSelector(s => s.settings)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: true,
    callback: async () => {
      setError(null)
      try {
        const value = await SettingsTauri.get()
        store.dispatch(settingsSet(value))
        setReady(true)
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    settings,
    ready,
    error,
  }
}
