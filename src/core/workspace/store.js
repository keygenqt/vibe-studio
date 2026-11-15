/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace state: the shell copy and the OS theme.
 */
import { createSlice } from '@reduxjs/toolkit'

import {
  CHAT_INPUT_SIZE_DEFAULT,
  LOCALE_DEFAULT,
  SIDE_BAR_SIZE_DEFAULT,
  THEME_DEFAULT,
} from '../../../constants'

// the block error keys: one per hook meaning, one per the background save
export const ERRORS = {
  window: 'window',
  chatInput: 'chatInput',
  locale: 'locale',
  sidebar: 'sidebar',
  theme: 'theme',
  save: 'save',
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    errors: {},
    windowWidth: null,
    windowHeight: null,
    theme: THEME_DEFAULT,
    locale: LOCALE_DEFAULT,
    chatInputSize: CHAT_INPUT_SIZE_DEFAULT,
    sideBarSize: SIDE_BAR_SIZE_DEFAULT,
    sideBarCollapsed: false,
    systemTheme: null,
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
    // the wire lands in snake_case: the copy translates it on the boundary
    workspaceSet: (state, action) => {
      state.windowWidth = action.payload.window_width
      state.windowHeight = action.payload.window_height
      state.chatInputSize = action.payload.chat_input_size ?? CHAT_INPUT_SIZE_DEFAULT
      state.sideBarSize = action.payload.side_bar_size ?? SIDE_BAR_SIZE_DEFAULT
      state.sideBarCollapsed = action.payload.side_bar_collapsed
    },
    sideBarSizeSet: (state, action) => {
      state.sideBarSize = action.payload
    },
    chatInputSizeSet: (state, action) => {
      state.chatInputSize = action.payload
    },
    sideBarCollapsedSet: (state, action) => {
      state.sideBarCollapsed = action.payload
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
  workspaceSet,
  sideBarSizeSet,
  chatInputSizeSet,
  sideBarCollapsedSet,
  systemThemeSet,
} = workspaceSlice.actions
export default workspaceSlice.reducer
