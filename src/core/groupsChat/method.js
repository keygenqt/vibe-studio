/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Groups chat writes: the Tauri commands; the fresh state lands through the block event.
 */
import { GroupsChatTauri } from './tauri'

export const GroupsChatMethod = {
  saveGroupChat: function (groupChat) {
    return GroupsChatTauri.saveGroupChat(groupChat)
  },
  deleteGroupChat: function (id) {
    return GroupsChatTauri.deleteGroupChat(id)
  },
  saveChat: function (chat) {
    return GroupsChatTauri.saveChat(chat)
  },
  deleteChat: function (id) {
    return GroupsChatTauri.deleteChat(id)
  },
  setGroupChatView: function (groupChatId, collapsedGroup, collapsedChats) {
    return GroupsChatTauri.setGroupChatView(groupChatId, collapsedGroup, collapsedChats)
  },
  selectGroupChat: function (groupChatId, chatId) {
    return GroupsChatTauri.selectGroupChat(groupChatId, chatId)
  },
  chatRegenerateName: function (chatId) {
    return GroupsChatTauri.chatRegenerateName(chatId)
  },
}
