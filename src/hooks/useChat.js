/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 */
import { useDispatch, useSelector } from 'react-redux'

import { chatDraftSet, chatMessageAdd } from '../store/impl/chat'

export function useChat(chatId) {
  const dispatch = useDispatch()
  const draft = useSelector(state => state.chat.draft)
  const all = useSelector(state => state.chat.messages)

  const setDraft = value => dispatch(chatDraftSet(value))

  const send = () => {
    if (!draft.trim()) return
    dispatch(chatMessageAdd({ id: Date.now(), chat_id: chatId, text: draft }))
    dispatch(chatDraftSet(''))
  }

  return {
    draft,
    setDraft,
    messages: chatId ? all.filter(message => message.chat_id === chatId) : all,
    send,
  }
}
