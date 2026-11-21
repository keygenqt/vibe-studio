/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Theme read: the resolved choice; syncs the bootstrap background cache.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { ACCENT_DEFAULT } from '../../../constants'
import { useEffectSingle } from '../../../hooks'
import { THEMES } from '../../../theme'
import { AppStorage } from '../../../utils'
import store from '../../store'
import { systemThemeSet } from '../store'
import { SettingsTauri } from '../tauri'

export function useTheme() {
  const settings = useSelector(s => s.settings)
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

  // the persisted choice with `system` resolved to the detected OS theme
  const mode = settings.appearanceTheme === 'system' ? systemTheme : settings.appearanceTheme
  const accent = settings.appearanceAccent
  const ready = settings.appearanceTheme !== 'system' || systemTheme !== null

  // the bootstrap background cache: index.html paints it before the app loads
  if (ready && mode) {
    const themePair = (THEMES[accent] ?? THEMES[ACCENT_DEFAULT])[mode]
    const color = themePair.palette.background.default
    if (AppStorage.readWindowBackground() !== color) {
      AppStorage.writeWindowBackground(color)
    }
  }

  return { mode, accent, ready, error }
}
