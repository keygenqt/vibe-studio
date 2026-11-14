/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Groups chat Tauri commands and its state event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export const GroupsChatTauri = {
  getGroupsChat: async function () {
    return invoke('get_groups_chat', {})
  },
  getGroupChat: async function (id) {
    return invoke('get_group_chat', { id })
  },
  saveGroupChat: async function (groupChat) {
    return invoke('save_group_chat', { groupChat })
  },
  deleteGroupChat: async function (id) {
    return invoke('delete_group_chat', { id })
  },
  getChats: async function () {
    return invoke('get_chats', {})
  },
  saveChat: async function (chat) {
    return invoke('save_chat', { chat })
  },
  deleteChat: async function (id) {
    return invoke('delete_chat', { id })
  },
  getGroupChatHistories: async function () {
    return invoke('get_group_chat_histories', {})
  },
  setGroupChatView: async function (groupChatId, collapsedGroup, collapsedChats) {
    return invoke('set_group_chat_view', {
      groupChatId,
      collapsedGroup,
      collapsedChats,
    })
  },
  selectGroupChat: async function (groupChatId, chatId) {
    return invoke('select_group_chat', { groupChatId, chatId: chatId ?? null })
  },
  chatRegenerateName: async function (chatId) {
    return invoke('chat_regenerate_name', { chatId })
  },
  onState: function (callback) {
    return listen('event-groups-chat', event => {
      callback(event.payload.value)
    })
  },
}
