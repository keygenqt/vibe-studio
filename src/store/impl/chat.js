/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    draft: '',
    messages: [],
  },
  reducers: {
    chatDraftSet: (state, action) => {
      state.draft = action.payload
    },
    chatMessagesSet: (state, action) => {
      state.messages = action.payload
    },
    chatMessageAdd: (state, action) => {
      state.messages.push(action.payload)
    },
  },
})

export const { chatDraftSet, chatMessagesSet, chatMessageAdd } = chatSlice.actions
export default chatSlice.reducer
