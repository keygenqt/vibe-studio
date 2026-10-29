/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

const groupsChatSlice = createSlice({
  name: 'groups_chat',
  initialState: {
    groupsChat: null,
    chats: [],
    groupChat: {},
    history: null,
  },
  reducers: {
    groupsChatSet: (state, action) => {
      state.groupsChat = action.payload
    },
    chatsSet: (state, action) => {
      state.chats = action.payload
    },
    groupChatSet: (state, action) => {
      state.groupChat[action.payload.id] = action.payload
    },
    groupChatHistorySet: (state, action) => {
      state.history = action.payload
    },
  },
})

export const { groupsChatSet, chatsSet, groupChatSet, groupChatHistorySet } =
  groupsChatSlice.actions
export default groupsChatSlice.reducer
