/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Chat Tauri commands, stream channels and its state event channel.
 */
import { Channel, invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

const streamChannel = callback => {
  const channel = new Channel()
  channel.onmessage = callback
  return channel
}

export const ChatTauri = {
  getHistory: async function (chatId) {
    return invoke('chat_get_history', { chatId })
  },
  sendMessage: async function (chatId, text, translate, attachments, onDelta) {
    return invoke('chat_send_message', {
      chatId,
      text,
      translate,
      attachments,
      onDelta: streamChannel(onDelta),
    })
  },
  cancelSend: async function (chatId) {
    return invoke('chat_cancel_send', { chatId })
  },
  setMessageShowType: async function (chatId, messageId, showType) {
    return invoke('chat_set_message_show_type', { chatId, messageId, showType })
  },
  deleteMessage: async function (chatId, messageId) {
    return invoke('chat_delete_message', { chatId, messageId })
  },
  setMessageCollapsed: async function (chatId, messageId, collapsed) {
    return invoke('chat_set_message_collapsed', { chatId, messageId, collapsed })
  },
  resendMessage: async function (chatId, messageId, onDelta) {
    return invoke('chat_resend_message', {
      chatId,
      messageId,
      onDelta: streamChannel(onDelta),
    })
  },
  translateMessage: async function (chatId, messageId, onDelta) {
    return invoke('chat_translate_message', {
      chatId,
      messageId,
      onDelta: streamChannel(onDelta),
    })
  },
  compressMessage: async function (chatId, useTaskModel, onDelta) {
    return invoke('chat_compress_message', {
      chatId,
      useTaskModel,
      onDelta: streamChannel(onDelta),
    })
  },
  onState: function (callback) {
    return listen('event-chat', event => {
      callback(event.payload.value)
    })
  },
}
