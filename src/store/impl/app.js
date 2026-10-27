/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 */
import { createSlice } from '@reduxjs/toolkit'

// The App block: render copy of the Rust app facts (version, debug
// flag) plus the transient UI state of the shell.
const appSlice = createSlice({
  name: 'app',
  initialState: {
    // facts served by get_app_info
    version: null,
    isDebug: false,
    // transient success handoff between pages, cleared right after reading
    formSuccess: null,
    // OS theme, arrives over event-app; the UI resolves it against
    // the persisted workspace choice
    systemTheme: 'light',
  },
  reducers: {
    appSet: (state, action) => {
      state.version = action.payload.version
      state.isDebug = action.payload.isDebug
    },
    formSuccessSet: (state, action) => {
      state.formSuccess = action.payload
    },
    formSuccessClear: state => {
      state.formSuccess = null
    },
    systemThemeSet: (state, action) => {
      state.systemTheme = action.payload
    },
  },
})

export const { appSet, formSuccessSet, formSuccessClear, systemThemeSet } = appSlice.actions
export default appSlice.reducer
