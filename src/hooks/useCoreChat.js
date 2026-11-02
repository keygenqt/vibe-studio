/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat block access: the draft, sending, the stream and history readiness.
 */
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Methods } from '../modules'
import { chatDraftSet, chatHistorySet } from '../store/impl/chat'

export function useCoreChat({ chatId } = {}) {
  const dispatch = useDispatch()
  const draft = useSelector(state => state.chat.draft)
  const chat = useSelector(state => state.chat.chat)
  // the copy paints only the routed chat: a stale final event of
  // another chat must not repaint here
  const history = useSelector(state =>
    state.chat.history !== null && state.chat.historyChatId === chatId ? state.chat.history : null
  )
  // the live answer of this chat only; a foreign stream keeps
  // running in the background without a bubble here
  const stream = useSelector(state =>
    state.chat.stream !== null && state.chat.stream.chatId === chatId ? state.chat.stream : null
  )
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    // the copy holds one chat at a time: the switch clears it —
    // the next read paints only the routed chat's messages
    dispatch(chatHistorySet({ chatId: null, history: null }))
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
    // the draft clears at once — the user message paints with the
    // `UserStored` event while the answer streams; a failed request
    // lands in the history as an `Error` message
    const text = draft
    dispatch(chatDraftSet(''))
    setSending(true)
    Methods.chat_send_message(chatId, text)
      // an early failure stored nothing — the draft comes back
      .catch(() => dispatch(chatDraftSet(text)))
      .finally(() => setSending(false))
  }

  // the running stream of this chat yields to a newer send by itself
  const stop = () => {
    if (chatId) Methods.chat_cancel_send(chatId).catch(console.error)
  }

  return {
    draft,
    setDraft,
    send,
    sending,
    streaming: stream !== null,
    stream,
    stop,
    chat,
    history,
    error,
    ready: error !== null || history !== null,
  }
}
