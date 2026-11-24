/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace state: the shell copy.
 */
import { createSlice } from '@reduxjs/toolkit'

import { CHAT_INPUT_SIZE_DEFAULT, SIDE_BAR_SIZE_DEFAULT } from '../../constants'

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    windowWidth: null,
    windowHeight: null,
    chatInputSize: CHAT_INPUT_SIZE_DEFAULT,
    sideBarSize: SIDE_BAR_SIZE_DEFAULT,
    sideBarCollapsed: false,
  },
  reducers: {
    workspaceSet: (state, action) => {
      Object.assign(state, action.payload)
      state.chatInputSize = state.chatInputSize ?? CHAT_INPUT_SIZE_DEFAULT
      state.sideBarSize = state.sideBarSize ?? SIDE_BAR_SIZE_DEFAULT
    },
  },
})

export const { workspaceSet } = workspaceSlice.actions
export default workspaceSlice.reducer
