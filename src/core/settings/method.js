/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Settings writes: save and the synchronous theme switch.
 */
import store, { runMutation } from '../store'
import { ERRORS, errorsClean, errorsCleanAll, errorsSet, settingsSet } from './store'
import { SettingsTauri } from './tauri'

const settingsState = () => store.getState().settings

const wire = state => ({
  appearance_theme: state.appearance_theme,
  appearance_locale: state.appearance_locale,
  appearance_accent: state.appearance_accent,
  appearance_chat_font_size: state.appearance_chat_font_size,
  tasks_model_light: state.tasks_model_light,
  tasks_model_heavy: state.tasks_model_heavy,
  chat_streaming: state.chat_streaming,
  chat_context_limit: state.chat_context_limit,
  translation_model: state.translation_model,
  translation_mine: state.translation_mine,
  translation_answers: state.translation_answers,
  notifications_ready: state.notifications_ready,
  notifications_updates: state.notifications_updates,
})

// the shared envelope bound to the block error actions
const catchError = (key, action) => runMutation({ errorsSet, errorsClean }, key, action)

export const SettingsMethod = {
  save: function (settings) {
    return catchError(ERRORS.save, () => SettingsTauri.save(settings))
  },
  setTheme: function (theme) {
    return catchError(ERRORS.theme, () => {
      const state = settingsState()
      if (!state.ready) return

      const previous = state.appearance_theme
      const next = { ...wire(state), appearance_theme: theme }
      store.dispatch(settingsSet(next))
      return SettingsTauri.save(next).catch(error => {
        // the optimistic theme rolls back: the copy holds only what Rust accepted
        store.dispatch(settingsSet({ appearance_theme: previous }))
        throw error
      })
    })
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
