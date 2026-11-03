/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Chat block commands, the stream channel and its event channel.
 */
import { Channel, invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import {
  chatSet,
  chatHistorySet,
  chatStatsSet,
  chatStreamAppend,
  chatStreamFinal,
  chatStreamStart,
  chatTranslateAppend,
  chatTranslateFinal,
  chatTranslateStart,
} from '../../store/impl/chat'

// the newest generation wins: a stale stream (cancelled by a newer
// request to the same model) paints and resets nothing
let streamSeq = 0

// the newest translation wins: a stale stream (cancelled by closing
// the view or by a newer translation of the message) paints nothing
let translateSeq = 0

export const chat = {
  chat_get_history: async function (chatId) {
    const state = await invoke('chat_get_history', { chatId })
    store.dispatch(chatSet(state.chat))
    store.dispatch(chatHistorySet({ chatId: state.chat?.id ?? null, history: state.history }))
    store.dispatch(chatStatsSet(state.stats))
    return state
  },
  chat_send_message: async function (chatId, text, translate) {
    const seq = ++streamSeq
    store.dispatch(chatStreamStart({ seq, chatId }))
    const channel = new Channel()
    channel.onmessage = chunk => {
      if (seq === streamSeq) {
        store.dispatch(chatStreamAppend({ seq, chatId, kind: chunk.kind, delta: chunk.delta }))
      }
    }
    try {
      // the fresh state lands through the block event; the answer
      // stays undispatched — one channel per the contract
      await invoke('chat_send_message', { chatId, text, translate, onDelta: channel })
    } finally {
      // the stream copy dies with the command: success or failure alike
      if (seq === streamSeq) {
        store.dispatch(chatStreamFinal(seq))
      }
    }
  },
  chat_cancel_send: async function (chatId) {
    return invoke('chat_cancel_send', { chatId })
  },
  // the fresh state lands through the block event — nothing to dispatch
  chat_delete_message: async function (chatId, messageId) {
    return invoke('chat_delete_message', { chatId, messageId })
  },
  chat_resend_message: async function (chatId, messageId) {
    const seq = ++streamSeq
    store.dispatch(chatStreamStart({ seq, chatId }))
    const channel = new Channel()
    channel.onmessage = chunk => {
      if (seq === streamSeq) {
        store.dispatch(chatStreamAppend({ seq, chatId, kind: chunk.kind, delta: chunk.delta }))
      }
    }
    try {
      await invoke('chat_resend_message', { chatId, messageId, onDelta: channel })
    } finally {
      if (seq === streamSeq) {
        store.dispatch(chatStreamFinal(seq))
      }
    }
  },
  // one button, two ways: open translates anew, close clears — the
  // column holds only the shown translation
  chat_translate_message: async function (chatId, messageId) {
    const seq = ++translateSeq
    store.dispatch(chatTranslateStart({ seq, messageId }))
    const channel = new Channel()
    channel.onmessage = chunk => {
      if (seq === translateSeq && chunk.kind === 'text') {
        store.dispatch(chatTranslateAppend({ seq, messageId, delta: chunk.delta }))
      }
    }
    try {
      await invoke('chat_translate_message', { chatId, messageId, onDelta: channel })
    } finally {
      if (seq === translateSeq) {
        store.dispatch(chatTranslateFinal(seq))
      }
    }
  },
  chat_translate_clear: async function (chatId, messageId) {
    // a fresh seq kills the running translation copy at once
    const seq = ++translateSeq
    store.dispatch(chatTranslateFinal(seq))
    return invoke('chat_translate_clear', { chatId, messageId })
  },
}

export function chat_events() {
  return [
    listen('event-chat', event => {
      const state = event.payload.value
      store.dispatch(chatSet(state.chat))
      store.dispatch(chatHistorySet({ chatId: state.chat?.id ?? null, history: state.history }))
      store.dispatch(chatStatsSet(state.stats))
    }),
  ]
}
