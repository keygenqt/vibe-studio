/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat read: the history mount load, the chat row and the page gate.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, chatStateSet, errorsSet } from '../store'
import { ChatTauri } from '../tauri'

export function useChat({ chatId } = {}) {
  // the copy reads: the base hook owns the chat row and its history
  const chat = useSelector(s => s.chat.chat)
  const historyChatId = useSelector(s => s.chat.historyChatId)
  const history = useSelector(s => (s.chat.historyChatId === chatId ? s.chat.history : null))
  const errors = useSelector(s => s.chat.errors)

  // the mount load: the routed chat history
  useEffectSingle({
    keys: [chatId],
    enabled: Boolean(chatId) && historyChatId !== chatId,
    callback: () =>
      ChatTauri.getHistory(chatId)
        .then(state => store.dispatch(chatStateSet(state)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.history]: String(error) }))),
  })

  return {
    chat,
    history,
    errors,
    ready: history !== null,
  }
}
