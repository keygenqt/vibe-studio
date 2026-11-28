/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Chat writes: composer mutations, streams and translation.
 */
import store from '../store'
import {
  chatAttachmentsAdd,
  chatAttachmentsClear,
  chatAttachmentsRemove,
  chatDraftSet,
  chatHistorySet,
  chatStreamAppend,
  chatStreamFinal,
  chatStreamStart,
  chatTranslateAppend,
  chatTranslateFinal,
  chatTranslateStart,
} from './store'
import { ChatTauri } from './tauri'

let streamSeq = 0
let translateSeq = 0

// the newest generation wins: stale streams paint and reset nothing
const runStream = async (chatId, invoke) => {
  const seq = ++streamSeq
  store.dispatch(chatStreamStart({ seq, chatId }))
  // the answer phase flips the bubble once per stream: when the text
  // begins, the thinking view of the live row gives way — the fresh
  // state rides the command's own event
  let sawText = false
  try {
    await invoke(chunk => {
      if (seq !== streamSeq) return
      store.dispatch(chatStreamAppend({ seq, chatId, kind: chunk.kind, text: chunk.text }))
      if (chunk.kind === 'text' && !sawText) {
        sawText = true
        const { history, historyChatId } = store.getState().chat
        const row = historyChatId === chatId
          ? (history ?? []).findLast(item => item.status === 'progress')
          : null
        if (row?.showType === 'thinking') {
          ChatTauri.setMessageShowType(chatId, row.id, 'text').catch(console.error)
        }
      }
    })
  } finally {
    if (seq === streamSeq) {
      store.dispatch(chatStreamFinal(seq))
    }
  }
}

// the translation generation: only text chunks land in its own slice
const runTranslate = async (messageId, invoke) => {
  const seq = ++translateSeq
  store.dispatch(chatTranslateStart({ seq, messageId }))
  try {
    await invoke(chunk => {
      if (seq === translateSeq && chunk.kind === 'text') {
        store.dispatch(chatTranslateAppend({ seq, messageId, text: chunk.text }))
      }
    })
  } finally {
    if (seq === translateSeq) {
      store.dispatch(chatTranslateFinal(seq))
    }
  }
}

export const ChatMethod = {
  setDraft: function (value) {
    store.dispatch(chatDraftSet(value))
  },
  addAttachments: function (items) {
    store.dispatch(chatAttachmentsAdd(items))
  },
  removeAttachment: function (index) {
    store.dispatch(chatAttachmentsRemove(index))
  },
  clearAttachments: function () {
    store.dispatch(chatAttachmentsClear())
  },
  clearHistory: function () {
    store.dispatch(chatHistorySet({ chatId: null, history: null }))
  },
  sendMessage: async function (chatId, text, translate, attachments) {
    // the composer copy clears at the send gesture — instant UI; the
    // block event confirms the stored message
    store.dispatch(chatDraftSet(''))
    store.dispatch(chatAttachmentsClear())
    await runStream(chatId, onDelta =>
      ChatTauri.sendMessage(chatId, text, translate, attachments, onDelta)
    )
  },
  cancelSend: function (chatId) {
    return ChatTauri.cancelSend(chatId)
  },
  setMessageShowType: function (chatId, messageId, showType) {
    return ChatTauri.setMessageShowType(chatId, messageId, showType)
  },
  deleteMessage: function (chatId, messageId) {
    return ChatTauri.deleteMessage(chatId, messageId)
  },
  setMessageCollapsed: function (chatId, messageId, collapsed) {
    return ChatTauri.setMessageCollapsed(chatId, messageId, collapsed)
  },
  resendMessage: async function (chatId, messageId) {
    await runStream(chatId, onDelta => ChatTauri.resendMessage(chatId, messageId, onDelta))
  },
  translateMessage: async function (chatId, messageId) {
    await runTranslate(messageId, onDelta => ChatTauri.translateMessage(chatId, messageId, onDelta))
  },
  compressMessage: async function (chatId, useTaskModel) {
    await runStream(chatId, onDelta => ChatTauri.compressMessage(chatId, useTaskModel, onDelta))
  },
}
