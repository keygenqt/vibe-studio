/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The groups chat block copy: groups, chats, rows, history.
 */
import { createSlice } from '@reduxjs/toolkit'

export const ERRORS = {
  groups: 'groups',
  chats: 'chats',
  history: 'history',
  group: 'group',
  saveGroup: 'saveGroup',
  deleteGroup: 'deleteGroup',
  saveChat: 'saveChat',
  deleteChat: 'deleteChat',
  view: 'view',
  select: 'select',
  regenerateName: 'regenerateName',
}

const groupsChatSlice = createSlice({
  name: 'groups_chat',
  initialState: {
    errors: {},
    groupsChat: null,
    chats: null,
    groupChat: {},
    history: null,
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
    groupsChatStateSet: (state, action) => {
      state.groupsChat = action.payload.groups_chat
      state.chats = action.payload.chats
      state.history = action.payload.history
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
    groupChatHistorySet: (state, action) => {
      state.history = action.payload
    },
  },
})

export const {
  errorsSet,
  errorsClean,
  errorsCleanAll,
  groupsChatStateSet,
  groupsChatSet,
  chatsSet,
  groupChatSet,
  groupChatHistorySet,
} = groupsChatSlice.actions
export default groupsChatSlice.reducer
