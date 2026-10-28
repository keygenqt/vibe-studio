/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { chatsSet, groupChatSet, groupsChatSet } from '../../store/impl/groups_chat'

export const groups_chat = {
  get_groups_chat: async function () {
    const list = await invoke('get_groups_chat', {})
    store.dispatch(groupsChatSet(list))
    return list
  },
  get_group_chat: async function (id) {
    const groupChat = await invoke('get_group_chat', { id })
    store.dispatch(groupChatSet(groupChat))
    return groupChat
  },
  save_group_chat: async function (groupChat) {
    const saved = await invoke('save_group_chat', { groupChat })
    await groups_chat.get_groups_chat()
    return saved
  },
  delete_group_chat: async function (id) {
    await invoke('delete_group_chat', { id })
    await groups_chat.get_groups_chat()
  },
  get_chats: async function () {
    const list = await invoke('get_chats', {})
    store.dispatch(chatsSet(list))
    return list
  },
  save_chat: async function (chat) {
    const saved = await invoke('save_chat', { chat })
    await groups_chat.get_chats()
    return saved
  },
  delete_chat: async function (id) {
    await invoke('delete_chat', { id })
    await groups_chat.get_chats()
  },
}

export function groups_chat_events() {
  return [
    listen('event-groups-chat', event => {
      if (event.payload.key === 'groups_chat') {
        store.dispatch(groupsChatSet(event.payload.value))
      }
      if (event.payload.key === 'chats') {
        store.dispatch(chatsSet(event.payload.value))
      }
    }),
  ]
}
