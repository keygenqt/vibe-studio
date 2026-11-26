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
  FONT_DEFAULT,
  LOCALE_DEFAULT,
  NOTIFICATIONS_DEFAULT,
  THEME_DEFAULT,
  TRANSLATE_LOCALE_DEFAULT,
} from '../../constants'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    appearanceTheme: THEME_DEFAULT,
    appearanceLocale: LOCALE_DEFAULT,
    appearanceFont: FONT_DEFAULT,
    appearanceAccent: ACCENT_DEFAULT,
    appearanceChatFontSize: CHAT_FONT_SIZE_DEFAULT,
    tasksModelLight: null,
    tasksModelHeavy: null,
    chatStreaming: CHAT_STREAMING_DEFAULT,
    chatContextLimit: null,
    translationModel: null,
    translationMine: TRANSLATE_LOCALE_DEFAULT,
    translationAnswers: TRANSLATE_LOCALE_DEFAULT,
    notificationsReady: NOTIFICATIONS_DEFAULT,
    notificationsUpdates: NOTIFICATIONS_DEFAULT,
    systemTheme: null,
  },
  reducers: {
    settingsSet: (state, action) => {
      Object.assign(state, action.payload)
      state.appearanceTheme = state.appearanceTheme ?? THEME_DEFAULT
      state.appearanceLocale = state.appearanceLocale ?? LOCALE_DEFAULT
      state.appearanceFont = state.appearanceFont ?? FONT_DEFAULT
      state.appearanceAccent = state.appearanceAccent ?? ACCENT_DEFAULT
      state.appearanceChatFontSize = state.appearanceChatFontSize ?? CHAT_FONT_SIZE_DEFAULT
      state.chatStreaming = state.chatStreaming ?? CHAT_STREAMING_DEFAULT
      state.translationMine = state.translationMine ?? TRANSLATE_LOCALE_DEFAULT
      state.translationAnswers = state.translationAnswers ?? TRANSLATE_LOCALE_DEFAULT
      state.notificationsReady = state.notificationsReady ?? NOTIFICATIONS_DEFAULT
      state.notificationsUpdates = state.notificationsUpdates ?? NOTIFICATIONS_DEFAULT
    },
    systemThemeSet: (state, action) => {
      state.systemTheme = String(action.payload).toLowerCase()
    },
  },
})

export const { settingsSet, systemThemeSet } = settingsSlice.actions
export default settingsSlice.reducer
