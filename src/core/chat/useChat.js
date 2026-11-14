/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat read: the history mount load, draft, stats and active streams.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../hooks'
import store from '../store'
import { ERRORS, chatStateSet, errorsSet } from './store'
import { ChatTauri } from './tauri'

export function useChat({ chatId } = {}) {
  // the copy reads: history and stream paint for the routed chat only
  const draft = useSelector(s => s.chat.draft)
  const chatAttachments = useSelector(s => s.chat.chatAttachments)
  const chat = useSelector(s => s.chat.chat)
  const historyChatId = useSelector(s => s.chat.historyChatId)
  const history = useSelector(s => (s.chat.historyChatId === chatId ? s.chat.history : null))
  const stats = useSelector(s => s.chat.stats)
  const stream = useSelector(s => (s.chat.stream?.chatId === chatId ? s.chat.stream : null))
  const translateStream = useSelector(s => s.chat.translateStream)
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
    draft,
    errors,
    chatAttachments,
    chat,
    history,
    stats,
    stream,
    translateStream,
    streaming: stream !== null,
    ready: history !== null,
  }
}
