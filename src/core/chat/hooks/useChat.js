/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat read: the history mount load, the chat row and the page gate.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { chatStateSet } from '../store'
import { ChatTauri } from '../tauri'

export function useChat({ chatId } = {}) {
  const chat = useSelector(s => s.chat.chat)
  const stats = useSelector(s => s.chat.stats)
  const historyChatId = useSelector(s => s.chat.historyChatId)
  const history = useSelector(s => (s.chat.historyChatId === chatId ? s.chat.history : null))
  const [error, setError] = useState(null)

  useEffectSingle({
    keys: [chatId],
    enabled: Boolean(chatId) && historyChatId !== chatId,
    callback: async () => {
      setError(null)
      try {
        const state = await ChatTauri.getHistory(chatId)
        store.dispatch(chatStateSet(state))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    chat,
    stats,
    history,
    error,
    ready: history !== null,
  }
}
