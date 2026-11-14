/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The chat event: the fresh snapshot lands and a finished stream is closed.
 */
import store from '../store'
import { chatStateSet, chatStreamFinal } from './store'
import { ChatTauri } from './tauri'

export function chatEvents() {
  return [
    ChatTauri.onState(state => {
      const stream = store.getState().chat.stream
      if (
        stream &&
        stream.chatId === (state.chat?.id ?? null) &&
        !state.history?.some(message => message.status === 'progress')
      ) {
        store.dispatch(chatStreamFinal(stream.seq))
      }
      store.dispatch(chatStateSet(state))
    }),
  ]
}
