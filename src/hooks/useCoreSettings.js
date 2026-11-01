/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Settings access: user preferences, theme choice, locale.
 */
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import i18next from 'i18next'

import { Methods } from '../modules'
import { settingsSet } from '../store/impl/settings'

export function useCoreSettings() {
  const dispatch = useDispatch()
  const raw = useSelector(state => state.settings)

  React.useEffect(() => {
    Methods.get_settings()
  }, [])

  React.useEffect(() => {
    if (raw.ready && i18next.language !== raw.appearance_locale) {
      i18next.changeLanguage(raw.appearance_locale)
    }
  }, [raw.ready, raw.appearance_locale])

  const wire = () => ({
    appearance_theme: raw.appearance_theme,
    appearance_locale: raw.appearance_locale,
    appearance_accent: raw.appearance_accent,
    appearance_chat_font_size: raw.appearance_chat_font_size,
    tasks_model_light: raw.tasks_model_light,
    tasks_model_heavy: raw.tasks_model_heavy,
    chat_streaming: raw.chat_streaming,
    chat_keep_messages: raw.chat_keep_messages,
    translation_model: raw.translation_model,
    translation_mine: raw.translation_mine,
    translation_answers: raw.translation_answers,
    notifications_ready: raw.notifications_ready,
    notifications_updates: raw.notifications_updates,
  })

  const setTheme = theme => {
    if (!raw.ready) return
    const next = { ...wire(), appearance_theme: theme }
    dispatch(settingsSet(next))
    Methods.save_settings(next)
  }

  return {
    ready: raw.ready,
    settings: raw,
    setTheme,
  }
}
