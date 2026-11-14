/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace state: the actual shell copy and its active save snapshot.
 */
import { createSlice } from '@reduxjs/toolkit'

import {
  CHAT_INPUT_SIZE_DEFAULT,
  LOCALE_DEFAULT,
  SIDE_BAR_SIZE_DEFAULT,
  THEME_DEFAULT,
} from '../../../constants'

// the block error keys: one per mount load
export const ERRORS = { load: 'load' }

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    ready: false,
    errors: {},
    window_width: null,
    window_height: null,
    theme: THEME_DEFAULT,
    locale: LOCALE_DEFAULT,
    chat_input_size: CHAT_INPUT_SIZE_DEFAULT,
    side_bar_size: SIDE_BAR_SIZE_DEFAULT,
    side_bar_collapsed: false,
    // the flat fields above are Actual; this is the snapshot of the active save
    workspaceSave: null,
    workspaceSaveError: null,
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
    workspaceSet: (state, action) => {
      Object.assign(state, action.payload)
      state.chat_input_size = state.chat_input_size ?? CHAT_INPUT_SIZE_DEFAULT
      state.side_bar_size = state.side_bar_size ?? SIDE_BAR_SIZE_DEFAULT
      state.ready = true
    },
    sideBarSizeSet: (state, action) => {
      state.side_bar_size = action.payload
    },
    chatInputSizeSet: (state, action) => {
      state.chat_input_size = action.payload
    },
    sideBarCollapsedSet: (state, action) => {
      state.side_bar_collapsed = action.payload
    },
    workspaceSaveStart: (state, action) => {
      state.workspaceSave = action.payload
      state.workspaceSaveError = null
    },
    workspaceSaveFinish: state => {
      state.workspaceSave = null
    },
    workspaceSaveFail: (state, action) => {
      state.workspaceSave = null
      state.workspaceSaveError = action.payload
    },
  },
})

export const {
  errorsSet,
  errorsClean,
  errorsCleanAll,
  workspaceSet,
  sideBarSizeSet,
  chatInputSizeSet,
  sideBarCollapsedSet,
  workspaceSaveStart,
  workspaceSaveFinish,
  workspaceSaveFail,
} = workspaceSlice.actions
export default workspaceSlice.reducer
