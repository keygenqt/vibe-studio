/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Groups chat writes: mutations returning the fresh block state.
 */
import store, { runMutation } from '../store'
import { ERRORS, errorsClean, errorsCleanAll, errorsSet } from './store'
import { GroupsChatTauri } from './tauri'

// the shared envelope bound to the block error actions
const catchError = (key, action) => runMutation({ errorsSet, errorsClean }, key, action)

export const GroupsChatMethod = {
  saveGroupChat: function (groupChat) {
    return catchError(ERRORS.saveGroup, () => {
      // the fresh state lands through the block event; the answer stays undispatched
      return GroupsChatTauri.saveGroupChat(groupChat)
    })
  },
  deleteGroupChat: function (id) {
    return catchError(ERRORS.deleteGroup, () => GroupsChatTauri.deleteGroupChat(id))
  },
  saveChat: function (chat) {
    return catchError(ERRORS.saveChat, () => GroupsChatTauri.saveChat(chat))
  },
  deleteChat: function (id) {
    return catchError(ERRORS.deleteChat, () => GroupsChatTauri.deleteChat(id))
  },
  setGroupChatView: function (groupChatId, collapsedGroup, collapsedChats) {
    return catchError(ERRORS.view, () =>
      GroupsChatTauri.setGroupChatView(groupChatId, collapsedGroup, collapsedChats)
    )
  },
  selectGroupChat: function (groupChatId, chatId) {
    return catchError(ERRORS.select, () => GroupsChatTauri.selectGroupChat(groupChatId, chatId))
  },
  chatRegenerateName: function (chatId) {
    return catchError(ERRORS.regenerateName, () => GroupsChatTauri.chatRegenerateName(chatId))
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
