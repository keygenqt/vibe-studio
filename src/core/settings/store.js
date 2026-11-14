/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The settings copy: user preferences with UI defaults applied.
 */
import { createSlice } from '@reduxjs/toolkit'

import {
  ACCENT_DEFAULT,
  CHAT_FONT_SIZE_DEFAULT,
  CHAT_STREAMING_DEFAULT,
  LOCALE_DEFAULT,
  NOTIFICATIONS_DEFAULT,
  THEME_DEFAULT,
  TRANSLATE_LOCALE_DEFAULT,
} from '../../../constants'

export const ERRORS = { load: 'load', save: 'save', theme: 'theme' }

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    ready: false,
    errors: {},
    appearance_theme: THEME_DEFAULT,
    appearance_locale: LOCALE_DEFAULT,
    appearance_accent: ACCENT_DEFAULT,
    appearance_chat_font_size: CHAT_FONT_SIZE_DEFAULT,
    tasks_model_light: null,
    tasks_model_heavy: null,
    chat_streaming: CHAT_STREAMING_DEFAULT,
    chat_context_limit: null,
    translation_model: null,
    translation_mine: TRANSLATE_LOCALE_DEFAULT,
    translation_answers: TRANSLATE_LOCALE_DEFAULT,
    notifications_ready: NOTIFICATIONS_DEFAULT,
    notifications_updates: NOTIFICATIONS_DEFAULT,
  },
  reducers: {
    errorsSet: (state, action) => {
      state.errors = { ...state.errors, ...action.payload }
    },
    errorsClean: (state, action) => {
      delete state.errors[action.payload]
    },
    errorsCleanAll: state => {
      state.errors = {}
    },
    settingsSet: (state, action) => {
      Object.assign(state, action.payload)
      // untouched values resolve to the UI defaults
      state.appearance_accent = state.appearance_accent ?? ACCENT_DEFAULT
      state.appearance_chat_font_size = state.appearance_chat_font_size ?? CHAT_FONT_SIZE_DEFAULT
      state.chat_streaming = state.chat_streaming ?? CHAT_STREAMING_DEFAULT
      state.translation_mine = state.translation_mine ?? TRANSLATE_LOCALE_DEFAULT
      state.translation_answers = state.translation_answers ?? TRANSLATE_LOCALE_DEFAULT
      state.notifications_ready = state.notifications_ready ?? NOTIFICATIONS_DEFAULT
      state.notifications_updates = state.notifications_updates ?? NOTIFICATIONS_DEFAULT
      state.ready = true
    },
  },
})

export const { errorsSet, errorsClean, errorsCleanAll, settingsSet } = settingsSlice.actions
export default settingsSlice.reducer
