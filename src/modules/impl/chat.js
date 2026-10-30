/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Chat block commands and its event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { chatSet, chatHistorySet } from '../../store/impl/chat'

export const chat = {
  chat_get_history: async function (chatId) {
    const history = await invoke('chat_get_history', { chatId })
    store.dispatch(chatHistorySet(history))
    return history
  },
  chat_send_message: async function (chatId, text) {
    const state = await invoke('chat_send_message', { chatId, text })
    store.dispatch(chatSet(state.chat))
    store.dispatch(chatHistorySet(state.history))
    return state
  },
}

export function chat_events() {
  return [
    listen('event-chat', event => {
      const state = event.payload.value
      store.dispatch(chatSet(state.chat))
      store.dispatch(chatHistorySet(state.history))
    }),
  ]
}
