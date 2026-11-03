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
    // the composer attachments: {kind: 'file', path} | {kind: 'image', png}
    chatAttachments: [],
    chat: null,
    history: null,
    stats: null,
    // the growing answer of the active stream: {seq, chatId, thinking, text}
    stream: null,
  },
  reducers: {
    chatDraftSet: (state, action) => {
      state.draft = action.payload
    },
    chatAttachmentsAdd: (state, action) => {
      state.chatAttachments = [...state.chatAttachments, ...action.payload]
    },
    chatAttachmentsClear: state => {
      state.chatAttachments = []
    },
    chatSet: (state, action) => {
      state.chat = action.payload
    },
    chatHistorySet: (state, action) => {
      state.history = action.payload.history
      state.historyChatId = action.payload.chatId
    },
    chatStatsSet: (state, action) => {
      state.stats = action.payload
    },
    // the stream generations: `seq` marks the newest send — stale
    // deltas and completions of a cancelled request change nothing
    chatStreamStart: (state, action) => {
      state.stream = {
        seq: action.payload.seq,
        chatId: action.payload.chatId,
        thinking: '',
        text: '',
      }
    },
    chatStreamAppend: (state, action) => {
      const { seq, chatId, kind, delta } = action.payload
      if (state.stream && state.stream.seq > seq) return
      if (state.stream === null || state.stream.seq !== seq) {
        state.stream = { seq, chatId, thinking: '', text: '' }
      }
      state.stream[kind] = (state.stream[kind] ?? '') + delta
    },
    chatStreamFinal: (state, action) => {
      if (state.stream && state.stream.seq <= action.payload) {
        state.stream = null
      }
    },
  },
})

export const {
  chatDraftSet,
  chatAttachmentsAdd,
  chatAttachmentsClear,
  chatSet,
  chatHistorySet,
  chatStatsSet,
  chatStreamStart,
  chatStreamAppend,
  chatStreamFinal,
} = chatSlice.actions
export default chatSlice.reducer
