/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The groups chat block copy: groups, chats, rows, history.
 */
import { createSlice } from '@reduxjs/toolkit'

const groupsChatSlice = createSlice({
  name: 'groupsChat',
  initialState: {
    groupsChat: null,
    chats: null,
    groupChat: {},
    history: null,
  },
  reducers: {
    groupsChatStateSet: (state, action) => {
      Object.assign(state, action.payload)
      state.groupChat = Object.fromEntries(
        (state.groupsChat ?? []).filter(row => state.groupChat[row.id]).map(row => [row.id, row])
      )
    },
    groupsChatSet: (state, action) => {
      state.groupsChat = action.payload
    },
    chatsSet: (state, action) => {
      state.chats = action.payload
    },
    groupChatSet: (state, action) => {
      state.groupChat[action.payload.id] = action.payload
    },
    historySet: (state, action) => {
      state.history = action.payload
    },
  },
})

export const { groupsChatStateSet, groupsChatSet, chatsSet, groupChatSet, historySet } =
  groupsChatSlice.actions
export default groupsChatSlice.reducer
