/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import {
  chatsSet,
  groupChatHistorySet,
  groupChatSet,
  groupsChatSet,
} from '../../store/impl/groups_chat'

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
    const state = await invoke('save_group_chat', { groupChat })
    store.dispatch(groupsChatSet(state.groups_chat))
    store.dispatch(chatsSet(state.chats))
    store.dispatch(groupChatHistorySet(state.history))
    return state
  },
  delete_group_chat: async function (id) {
    const state = await invoke('delete_group_chat', { id })
    store.dispatch(groupsChatSet(state.groups_chat))
    store.dispatch(chatsSet(state.chats))
    store.dispatch(groupChatHistorySet(state.history))
    return state
  },
  get_chats: async function () {
    const list = await invoke('get_chats', {})
    store.dispatch(chatsSet(list))
    return list
  },
  save_chat: async function (chat) {
    const state = await invoke('save_chat', { chat })
    store.dispatch(groupsChatSet(state.groups_chat))
    store.dispatch(chatsSet(state.chats))
    store.dispatch(groupChatHistorySet(state.history))
    return state
  },
  delete_chat: async function (id) {
    const state = await invoke('delete_chat', { id })
    store.dispatch(groupsChatSet(state.groups_chat))
    store.dispatch(chatsSet(state.chats))
    store.dispatch(groupChatHistorySet(state.history))
    return state
  },
  get_group_chat_histories: async function () {
    const list = await invoke('get_group_chat_histories', {})
    store.dispatch(groupChatHistorySet(list))
    return list
  },
  set_group_chat_view: async function (groupChatId, collapsedGroup, collapsedChats) {
    const state = await invoke('set_group_chat_view', {
      groupChatId,
      collapsedGroup,
      collapsedChats,
    })
    store.dispatch(groupsChatSet(state.groups_chat))
    store.dispatch(chatsSet(state.chats))
    store.dispatch(groupChatHistorySet(state.history))
  },
  select_group_chat: async function (groupChatId, chatId) {
    return invoke('select_group_chat', { groupChatId, chatId: chatId ?? null })
  },
}

export function groups_chat_events() {
  return [
    listen('event-groups-chat', event => {
      const state = event.payload.value
      store.dispatch(groupsChatSet(state.groups_chat))
      store.dispatch(chatsSet(state.chats))
      store.dispatch(groupChatHistorySet(state.history))
    }),
  ]
}
