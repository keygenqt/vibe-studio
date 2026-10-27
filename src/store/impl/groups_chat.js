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
    groupChat: {},
  },
  reducers: {
    groupsChatSet: (state, action) => {
      state.groupsChat = action.payload
    },
    groupChatSet: (state, action) => {
      state.groupChat[action.payload.id] = action.payload
    },
  },
})

export const { groupsChatSet, groupChatSet } = groupsChatSlice.actions
export default groupsChatSlice.reducer
