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
    // the growing translation of one message: {seq, messageId, text}
    translateStream: null,
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
    // the translation generations: `seq` marks the newest request —
    // stale deltas and completions of a replaced request change nothing
    chatTranslateStart: (state, action) => {
      state.translateStream = {
        seq: action.payload.seq,
        messageId: action.payload.messageId,
        text: '',
      }
    },
    chatTranslateAppend: (state, action) => {
      const { seq, messageId, delta } = action.payload
      if (state.translateStream && state.translateStream.seq > seq) return
      if (state.translateStream === null || state.translateStream.seq !== seq) {
        state.translateStream = { seq, messageId, text: '' }
      }
      state.translateStream.text += delta
    },
    chatTranslateFinal: (state, action) => {
      if (state.translateStream && state.translateStream.seq <= action.payload) {
        state.translateStream = null
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
  chatTranslateStart,
  chatTranslateAppend,
  chatTranslateFinal,
} = chatSlice.actions
export default chatSlice.reducer
