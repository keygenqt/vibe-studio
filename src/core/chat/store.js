/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The chat block copy: draft, chat row, message history.
 */
import { createSlice } from '@reduxjs/toolkit'

export const ERRORS = {
  history: 'history',
  send: 'send',
  cancel: 'cancel',
  showType: 'showType',
  deleteMessage: 'deleteMessage',
  collapsed: 'collapsed',
  resend: 'resend',
  translate: 'translate',
  compress: 'compress',
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    draft: '',
    errors: {},
    // the composer attachments: {kind: 'file', path} | {kind: 'image', png}
    chatAttachments: [],
    chat: null,
    history: null,
    historyChatId: null,
    stats: null,
    // the growing answer of the active stream: {seq, chatId, thinking, text}
    stream: null,
    // the growing translation of one message: {seq, messageId, text}
    translateStream: null,
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
    chatDraftSet: (state, action) => {
      state.draft = action.payload
    },
    chatAttachmentsAdd: (state, action) => {
      // the same file or image joins the draft once — duplicates
      // are dropped silently, in the batch and against the draft
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
    // the whole block snapshot from one payload: event answers and loads alike
    chatStateSet: (state, action) => {
      state.chat = action.payload.chat
      state.history = action.payload.history
      state.historyChatId = action.payload.chat?.id ?? null
      state.stats = action.payload.stats
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
    // both kinds are whole snapshots — the copy replaces, never accumulates
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
    // the translation generations: `seq` marks the newest request —
    // stale deltas and completions of a replaced request change nothing
    chatTranslateStart: (state, action) => {
      state.translateStream = {
        seq: action.payload.seq,
        messageId: action.payload.messageId,
        text: '',
      }
    },
    // the whole balanced translation replaces the copy
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
  errorsSet,
  errorsClean,
  errorsCleanAll,
  chatDraftSet,
  chatStateSet,
  chatAttachmentsAdd,
  chatAttachmentsRemove,
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
