/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Theme choice: the persisted choice with `system` resolved to the OS theme.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { useSettings } from '../../settings/hooks/useSettings'
import { ERRORS, errorsSet, systemThemeSet } from '../store'
import { WorkspaceTauri } from '../tauri'

export function useTheme() {
  // the settings composition: the choice and its readiness live in the settings block
  const settings = useSettings()

  // the copy read: the OS theme of the workspace copy
  const systemTheme = useSelector(s => s.workspace.systemTheme)
  const errors = useSelector(s => s.workspace.errors)

  // the mount load: the initial OS theme, the channel covers the changes
  useEffectSingle({
    enabled: systemTheme === null,
    callback: () =>
      WorkspaceTauri.getSystemTheme()
        .then(value => store.dispatch(systemThemeSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.theme]: String(error) }))),
  })

  // the persisted choice wins, `system` resolves to the detected OS theme
  const mode =
    settings.settings.appearance_theme === 'system'
      ? systemTheme
      : settings.settings.appearance_theme

  return {
    mode,
    accent: settings.settings.appearance_accent,
    errors,
  }
}
