/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states', 'facts']
 * INFO: The app copy: version, debug flag, startup readiness.
 */
import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    version: null,
    isDebug: false,
    ready: false,
  },
  reducers: {
    appSet: (state, action) => {
      state.version = action.payload.version
      state.isDebug = action.payload.isDebug
    },
    appReadySet: state => {
      state.ready = true
    },
  },
})

export const { appSet, appReadySet } = appSlice.actions
export default appSlice.reducer
