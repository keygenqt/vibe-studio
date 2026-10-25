/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

// Pure UI state only. Application state lives in Rust — the
// WorkspaceProvider mirrors it, this store never holds a copy.
export const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    // transient success handoff between pages, cleared right after reading
    formSuccess: null,
  },
  reducers: {
    formSuccessSet: (state, action) => {
      state.formSuccess = action.payload
    },
    formSuccessClear: state => {
      state.formSuccess = null
    },
  },
})

export const { formSuccessSet, formSuccessClear } = appStateSlice.actions

export default appStateSlice.reducer
