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
    chatAttachments: [],
    chat: null,
    history: null,
    historyChatId: null,
    stats: null,
    stream: null,
    translateStream: null,
  },
  reducers: {
    chatDraftSet: (state, action) => {
      state.draft = action.payload
    },
    chatAttachmentsAdd: (state, action) => {
      const known = new Set(
        state.chatAttachments.map(item =>
          item.kind === 'file' ? `file:${item.path}` : `image:${item.png}`
        )
      )
      const fresh = action.payload.filter(item => {
        const key = item.kind === 'file' ? `file:${item.path}` : `image:${item.png}`
        if (known.has(key)) return false
        known.add(key)
        return true
      })
      state.chatAttachments = [...state.chatAttachments, ...fresh]
    },
    chatAttachmentsRemove: (state, action) => {
      state.chatAttachments = state.chatAttachments.filter((_, index) => index !== action.payload)
    },
    chatAttachmentsClear: state => {
      state.chatAttachments = []
    },
    chatStateSet: (state, action) => {
      state.chat = action.payload.chat
      state.history = action.payload.history
      state.historyChatId = action.payload.chat?.id ?? null
      state.stats = action.payload.stats
      // a snapshot without an in-flight message closes the stream of this chat
      if (
        state.stream &&
        state.stream.chatId === state.historyChatId &&
        !state.history?.some(message => message.status === 'progress')
      ) {
        state.stream = null
      }
    },
    chatHistorySet: (state, action) => {
      state.history = action.payload.history
      state.historyChatId = action.payload.chatId
    },
    // seq marks the newest send: stale deltas and completions change nothing
    chatStreamStart: (state, action) => {
      state.stream = {
        seq: action.payload.seq,
        chatId: action.payload.chatId,
        thinking: '',
        text: '',
      }
    },
    // each chunk is a whole snapshot: the copy replaces, never accumulates
    chatStreamAppend: (state, action) => {
      const { seq, chatId, kind, text } = action.payload
      if (state.stream && state.stream.seq > seq) return
      if (state.stream === null || state.stream.seq !== seq) {
        state.stream = { seq, chatId, thinking: '', text: '' }
      }
      state.stream[kind] = text
    },
    chatStreamFinal: (state, action) => {
      if (state.stream && state.stream.seq <= action.payload) {
        state.stream = null
      }
    },
    // seq marks the newest translation: stale deltas and completions change nothing
    chatTranslateStart: (state, action) => {
      state.translateStream = {
        seq: action.payload.seq,
        messageId: action.payload.messageId,
        text: '',
      }
    },
    // each chunk is a whole snapshot: the copy replaces, never accumulates
    chatTranslateAppend: (state, action) => {
      const { seq, messageId, text } = action.payload
      if (state.translateStream && state.translateStream.seq > seq) return
      if (state.translateStream === null || state.translateStream.seq !== seq) {
        state.translateStream = { seq, messageId, text: '' }
      }
      state.translateStream.text = text
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
  chatAttachmentsRemove,
  chatAttachmentsClear,
  chatStateSet,
  chatHistorySet,
  chatStreamStart,
  chatStreamAppend,
  chatStreamFinal,
  chatTranslateStart,
  chatTranslateAppend,
  chatTranslateFinal,
} = chatSlice.actions
export default chatSlice.reducer
