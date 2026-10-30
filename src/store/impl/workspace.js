/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The workspace copy: shell environment with UI defaults applied.
 */
import { createSlice } from '@reduxjs/toolkit'

import { CHAT_INPUT_SIZE_DEFAULT, SIDE_BAR_SIZE_DEFAULT } from '../../constants'

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
  },
})

export const { workspaceSet, sideBarSizeSet, chatInputSizeSet } = workspaceSlice.actions
export default workspaceSlice.reducer
