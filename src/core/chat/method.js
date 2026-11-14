/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Chat writes: composer mutations, streams and translation.
 */
import store, { runMutation } from '../store'
import {
  ERRORS,
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
  errorsClean,
  errorsCleanAll,
  errorsSet,
} from './store'
import { ChatTauri } from './tauri'

// the newest generation wins: stale streams paint and reset nothing
let streamSeq = 0
let translateSeq = 0

// every chunk is a whole snapshot — the copy replaces, not appends
const runStream = async (seq, chatId, invokeStream) => {
  try {
    await invokeStream(chunk => {
      if (seq !== streamSeq) return
      store.dispatch(chatStreamAppend({ seq, chatId, kind: chunk.kind, text: chunk.text }))
    })
  } finally {
    if (seq === streamSeq) {
      store.dispatch(chatStreamFinal(seq))
    }
  }
}

// the shared envelope bound to the block error actions
const catchError = (key, action) => runMutation({ errorsSet, errorsClean }, key, action)

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
  sendMessage: function (chatId, text, translate, attachments) {
    return catchError(ERRORS.send, async () => {
      const seq = ++streamSeq
      store.dispatch(chatStreamStart({ seq, chatId }))
      // the fresh state lands through the block event; the answer stays undispatched
      await runStream(seq, chatId, onDelta =>
        ChatTauri.sendMessage(chatId, text, translate, attachments, onDelta)
      )
    })
  },
  cancelSend: function (chatId) {
    return catchError(ERRORS.cancel, () => ChatTauri.cancelSend(chatId))
  },
  setMessageShowType: function (chatId, messageId, showType) {
    return catchError(ERRORS.showType, () =>
      ChatTauri.setMessageShowType(chatId, messageId, showType)
    )
  },
  deleteMessage: function (chatId, messageId) {
    return catchError(ERRORS.deleteMessage, () => ChatTauri.deleteMessage(chatId, messageId))
  },
  setMessageCollapsed: function (chatId, messageId, collapsed) {
    return catchError(ERRORS.collapsed, () =>
      ChatTauri.setMessageCollapsed(chatId, messageId, collapsed)
    )
  },
  resendMessage: function (chatId, messageId) {
    return catchError(ERRORS.resend, async () => {
      const seq = ++streamSeq
      store.dispatch(chatStreamStart({ seq, chatId }))
      await runStream(seq, chatId, onDelta => ChatTauri.resendMessage(chatId, messageId, onDelta))
    })
  },
  // a stored translation shows itself; an empty one generates once
  translateMessage: function (chatId, messageId) {
    return catchError(ERRORS.translate, async () => {
      const seq = ++translateSeq
      store.dispatch(chatTranslateStart({ seq, messageId }))
      try {
        await ChatTauri.translateMessage(chatId, messageId, chunk => {
          if (seq === translateSeq && chunk.kind === 'text') {
            store.dispatch(chatTranslateAppend({ seq, messageId, text: chunk.text }))
          }
        })
      } finally {
        if (seq === translateSeq) {
          store.dispatch(chatTranslateFinal(seq))
        }
      }
    })
  },
  compressMessage: function (chatId, useTaskModel) {
    return catchError(ERRORS.compress, async () => {
      const seq = ++streamSeq
      store.dispatch(chatStreamStart({ seq, chatId }))
      await runStream(seq, chatId, onDelta =>
        ChatTauri.compressMessage(chatId, useTaskModel, onDelta)
      )
    })
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
