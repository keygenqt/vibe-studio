/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 * INFO: The app copy: version, debug flag, saved alert, OS theme.
 */
import { createSlice } from '@reduxjs/toolkit'

export const ERRORS = {
  load: 'load',
  writeText: 'writeText',
  writeImage: 'writeImage',
  writeFiles: 'writeFiles',
  clipboardClear: 'clipboardClear',
  clipboardRead: 'clipboardRead',
  openFiles: 'openFiles',
  stat: 'stat',
  openBrowser: 'openBrowser',
}

const appSlice = createSlice({
  name: 'app',
  initialState: {
    version: null,
    isDebug: false,
    ready: false,
    errors: {},
    formSuccess: null,
    systemTheme: 'light',
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
    appSet: (state, action) => {
      state.version = action.payload.version
      state.isDebug = action.payload.isDebug
    },
    appReadySet: state => {
      state.ready = true
    },
    formSuccessSet: (state, action) => {
      state.formSuccess = action.payload
    },
    formSuccessClear: state => {
      state.formSuccess = null
    },
    systemThemeSet: (state, action) => {
      state.systemTheme = String(action.payload).toLowerCase()
    },
  },
})

export const {
  errorsSet,
  errorsClean,
  errorsCleanAll,
  appSet,
  appReadySet,
  formSuccessSet,
  formSuccessClear,
  systemThemeSet,
} = appSlice.actions
export default appSlice.reducer
