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
  CHAT_KEEP_MESSAGES_DEFAULT,
  TRANSLATE_LOCALE_DEFAULT,
} from '../../constants'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    ready: false,
    appearance_theme: 'system',
    appearance_locale: 'ru',
    appearance_accent: ACCENT_DEFAULT,
    appearance_chat_font_size: CHAT_FONT_SIZE_DEFAULT,
    tasks_model_light: null,
    tasks_model_heavy: null,
    chat_streaming: true,
    chat_keep_messages: CHAT_KEEP_MESSAGES_DEFAULT,
    translation_model: null,
    translation_mine: TRANSLATE_LOCALE_DEFAULT,
    translation_answers: TRANSLATE_LOCALE_DEFAULT,
    notifications_ready: true,
    notifications_updates: true,
  },
  reducers: {
    settingsSet: (state, action) => {
      Object.assign(state, action.payload)
      // untouched values resolve to the UI defaults
      state.appearance_accent = state.appearance_accent ?? ACCENT_DEFAULT
      state.appearance_chat_font_size = state.appearance_chat_font_size ?? CHAT_FONT_SIZE_DEFAULT
      state.chat_streaming = state.chat_streaming ?? true
      state.chat_keep_messages = state.chat_keep_messages ?? CHAT_KEEP_MESSAGES_DEFAULT
      state.translation_mine = state.translation_mine ?? TRANSLATE_LOCALE_DEFAULT
      state.translation_answers = state.translation_answers ?? TRANSLATE_LOCALE_DEFAULT
      state.notifications_ready = state.notifications_ready ?? true
      state.notifications_updates = state.notifications_updates ?? true
      state.ready = true
    },
  },
})

export const { settingsSet } = settingsSlice.actions
export default settingsSlice.reducer
