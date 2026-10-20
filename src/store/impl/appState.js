/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    ready: false,
    theme: 'light',
    settings: { locale: 'ru', theme: 'system' },
  },
  reducers: {
    setAll: (state, data) => {
      state.ready = true
      state.theme = data.payload.theme
      state.settings = data.payload.settings
    },
  },
})

export const { setAll } = appStateSlice.actions

export default appStateSlice.reducer
