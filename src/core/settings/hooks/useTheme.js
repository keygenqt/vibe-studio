/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Theme read: the persisted choice with `system` resolved to the OS theme.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { useSettings } from './useSettings'
import { systemThemeSet } from '../store'
import { SettingsTauri } from '../tauri'

export function useTheme() {
  const settings = useSettings()
  const systemTheme = useSelector(s => s.settings.systemTheme)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: systemTheme === null,
    callback: async () => {
      setError(null)
      try {
        const value = await SettingsTauri.getSystemTheme()
        store.dispatch(systemThemeSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    mode:
      settings.settings.appearanceTheme === 'system'
        ? systemTheme
        : settings.settings.appearanceTheme,
    accent: settings.settings.appearanceAccent,
    error,
  }
}
