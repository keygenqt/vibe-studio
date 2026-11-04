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

// the newest translation wins: a stale stream (cancelled by switching
// the view or by a newer translation of the message) paints nothing
let translateSeq = 0

// one stream lifecycle: the channel and the seq guard; every chunk
// is a whole snapshot — the copy replaces, not appends
const runStream = async (seq, chatId, invokeStream) => {
  const channel = new Channel()
  channel.onmessage = chunk => {
    if (seq !== streamSeq) return
    store.dispatch(chatStreamAppend({ seq, chatId, kind: chunk.kind, text: chunk.text }))
  }
  try {
    await invokeStream(channel)
  } finally {
    // the stream copy dies with the command: success or failure alike
    if (seq === streamSeq) {
      store.dispatch(chatStreamFinal(seq))
    }
  }
}

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
    // the fresh state lands through the block event; the answer
    // stays undispatched — one channel per the contract
    await runStream(seq, chatId, channel =>
      invoke('chat_send_message', { chatId, text, translate, onDelta: channel })
    )
  },
  chat_cancel_send: async function (chatId) {
    return invoke('chat_cancel_send', { chatId })
  },
  // the fresh state lands through the block event — nothing to dispatch
  chat_set_message_show_type: async function (chatId, messageId, showType) {
    return invoke('chat_set_message_show_type', { chatId, messageId, showType })
  },
  // the fresh state lands through the block event — nothing to dispatch
  chat_delete_message: async function (chatId, messageId) {
    return invoke('chat_delete_message', { chatId, messageId })
  },
  chat_resend_message: async function (chatId, messageId) {
    const seq = ++streamSeq
    store.dispatch(chatStreamStart({ seq, chatId }))
    await runStream(seq, chatId, channel =>
      invoke('chat_resend_message', { chatId, messageId, onDelta: channel })
    )
  },
  // the column is the cache: a stored translation shows itself, an
  // empty one generates once — the switch away cancels the run
  chat_translate_message: async function (chatId, messageId) {
    const seq = ++translateSeq
    store.dispatch(chatTranslateStart({ seq, messageId }))
    const channel = new Channel()
    channel.onmessage = chunk => {
      if (seq === translateSeq && chunk.kind === 'text') {
        store.dispatch(chatTranslateAppend({ seq, messageId, text: chunk.text }))
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
