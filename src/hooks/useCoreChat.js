/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat block access: the draft, sending, and history readiness.
 */
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Methods } from '../modules'
import { chatDraftSet, chatHistorySet } from '../store/impl/chat'

export function useCoreChat({ chatId } = {}) {
  const dispatch = useDispatch()
  const draft = useSelector(state => state.chat.draft)
  const chat = useSelector(state => state.chat.chat)
  const history = useSelector(state => state.chat.history)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    // the copy holds one chat at a time: the switch clears it —
    // the next read paints only the routed chat's messages
    dispatch(chatHistorySet(null))
    if (chatId)
      Methods.chat_get_history(chatId).catch(error => {
        console.error('chat_get_history:', error)
        setError(error)
      })
  }, [chatId])

  const setDraft = value => dispatch(chatDraftSet(value))

  const [sending, setSending] = React.useState(false)

  const send = () => {
    if (!chatId || !draft.trim() || sending) return
    // a failed request lands in the history as an `Error` message —
    // the block state brings it; the command error leaves the draft
    setSending(true)
    Methods.chat_send_message(chatId, draft)
      .then(() => dispatch(chatDraftSet('')))
      .catch(() => {})
      .finally(() => setSending(false))
  }

  return {
    draft,
    setDraft,
    send,
    sending,
    chat,
    history,
    error,
    ready: error !== null || history !== null,
  }
}
