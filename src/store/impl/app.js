/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 */
import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    version: null,
    isDebug: false,
    formSuccess: null,
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
