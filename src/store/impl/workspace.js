/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

import { CHAT_INPUT_SIZE_DEFAULT, SIDE_BAR_SIZE_DEFAULT } from '../../constants'

// Render copy of the Rust workspace. Rust stays the source of truth:
// the load, every save answer and every event-workspace payload land
// here — wire fields, as Rust keeps them.
const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    ready: false,
    window_width: null,
    window_height: null,
    theme: 'system',
    locale: 'ru',
    chat_input_size: CHAT_INPUT_SIZE_DEFAULT,
    side_bar_size: SIDE_BAR_SIZE_DEFAULT,
    side_bar_collapsed: false,
  },
  reducers: {
    // merge of a fresh workspace answer (load, event-workspace payload)
    workspaceSet: (state, action) => {
      Object.assign(state, action.payload)
      state.ready = true
    },
    // live drag values; the whole row is saved on release
    sideBarSizeSet: (state, action) => {
      state.side_bar_size = action.payload
    },
    chatInputSizeSet: (state, action) => {
      state.chat_input_size = action.payload
    },
  },
})

export const { workspaceSet, sideBarSizeSet, chatInputSizeSet } = workspaceSlice.actions
export default workspaceSlice.reducer
