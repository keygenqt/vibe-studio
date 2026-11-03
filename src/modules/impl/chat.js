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
} from '../../store/impl/chat'

// the newest generation wins: a stale stream (cancelled by a newer
// request to the same model) paints and resets nothing
let streamSeq = 0

export const chat = {
  chat_get_history: async function (chatId) {
    const state = await invoke('chat_get_history', { chatId })
    store.dispatch(chatSet(state.chat))
    store.dispatch(chatHistorySet({ chatId: state.chat?.id ?? null, history: state.history }))
    store.dispatch(chatStatsSet(state.stats))
    return state
  },
  chat_send_message: async function (chatId, text) {
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
      await invoke('chat_send_message', { chatId, text, onDelta: channel })
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
