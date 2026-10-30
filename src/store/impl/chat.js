/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The chat block copy: draft, chat row, message history.
 */
import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    draft: '',
    chat: null,
    history: null,
  },
  reducers: {
    chatDraftSet: (state, action) => {
      state.draft = action.payload
    },
    chatSet: (state, action) => {
      state.chat = action.payload
    },
    chatHistorySet: (state, action) => {
      state.history = action.payload
    },
  },
})

export const { chatDraftSet, chatSet, chatHistorySet } = chatSlice.actions
export default chatSlice.reducer
