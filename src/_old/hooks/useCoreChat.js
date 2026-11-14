/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat block access: the draft, sending, the stream and history readiness.
 */
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Methods } from '../modules'
import { scrollToBottom } from '../init'
import {
  chatAttachmentsAdd,
  chatAttachmentsClear,
  chatAttachmentsRemove,
  chatDraftSet,
  chatHistorySet,
} from '../store/impl/chat'

export function useCoreChat({ chatId } = {}) {
  const dispatch = useDispatch()
  const draft = useSelector(state => state.chat.draft)
  const chatAttachments = useSelector(state => state.chat.chatAttachments)
  const chat = useSelector(state => state.chat.chat)
  // the copy paints only the routed chat: a stale final event of
  // another chat must not repaint here
  const history = useSelector(state =>
    state.chat.history !== null && state.chat.historyChatId === chatId ? state.chat.history : null
  )
  const stats = useSelector(state => state.chat.stats)
  // the live answer of this chat only; a foreign stream keeps
  // running in the background without a bubble here
  const stream = useSelector(state =>
    state.chat.stream !== null && state.chat.stream.chatId === chatId ? state.chat.stream : null
  )
  // the live translation copy: the messageId filter happens where
  // the message is rendered
  const translateStream = useSelector(state => state.chat.translateStream)
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
  const addAttachments = items => dispatch(chatAttachmentsAdd(items))
  const removeAttachment = index => dispatch(chatAttachmentsRemove(index))

  const [sending, setSending] = React.useState(false)
  // the failures before anything is stored: rejected attachments,
  // a vision-less model — the snackbar's own content
  const [sendError, setSendError] = React.useState(null)

  const send = (translate = false) => {
    if (!chatId || sending) return
    // the draft clears at once — the user message paints with the
    // `UserStored` event while the answer streams; a failed request
    // lands in the history as an `Error` message
    const text = draft
    const attachments = chatAttachments
    if (!text.trim() && !attachments.length) return
    dispatch(chatDraftSet(''))
    dispatch(chatAttachmentsClear())
    // the send is the user's will to watch: land at the bottom at
    // once and re-arm the follow for the streaming answer
    scrollToBottom('chat.history', false)
    setSending(true)
    Methods.chat_send_message(chatId, text, translate, attachments)
      // an early failure stored nothing — the draft and the
      // attachments come back, the reason lands in the snackbar
      .catch(error => {
        dispatch(chatDraftSet(text))
        dispatch(chatAttachmentsAdd(attachments))
        setSendError(String(error))
      })
      .finally(() => setSending(false))
  }

  // the running stream of this chat yields to a newer send by itself
  const stop = () => {
    if (chatId) Methods.chat_cancel_send(chatId).catch(console.error)
  }

  // the message and everything below it go away; a running stream
  // yields on the Rust side
  const remove = messageId => {
    if (!chatId) return
    Methods.chat_delete_message(chatId, messageId).catch(console.error)
  }

  const resend = messageId => {
    if (!chatId || sending) return
    Methods.chat_resend_message(chatId, messageId).catch(console.error)
  }

  return {
    draft,
    chatAttachments,
    addAttachments,
    removeAttachment,
    sendError,
    setSendError,
    setDraft,
    send,
    sending,
    streaming: stream !== null,
    stream,
    translateStream,
    stop,
    remove,
    resend,
    chat,
    history,
    stats,
    error,
    ready: error !== null || history !== null,
  }
}
