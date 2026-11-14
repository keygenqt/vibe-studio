/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Groups chat read: mount loads, collections, rows and history.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../hooks'
import store from '../store'
import {
  ERRORS,
  chatsSet,
  errorsSet,
  groupChatHistorySet,
  groupChatSet,
  groupsChatSet,
} from './store'
import { GroupsChatTauri } from './tauri'

export function useGroupsChat({ groupChatId } = {}) {
  // the copy reads: the group row paints for the routed group only
  const groupsChat = useSelector(s => s.groups_chat.groupsChat)
  const chats = useSelector(s => s.groups_chat.chats)
  const history = useSelector(s => s.groups_chat.history)
  const groupChat = useSelector(s => s.groups_chat.groupChat[groupChatId] ?? null)
  const errors = useSelector(s => s.groups_chat.errors)

  // the mount load: the groups collection
  useEffectSingle({
    enabled: groupsChat === null,
    callback: () =>
      GroupsChatTauri.getGroupsChat()
        .then(value => store.dispatch(groupsChatSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.groups]: String(error) }))),
  })

  // the mount load: the chats collection
  useEffectSingle({
    enabled: chats === null,
    callback: () =>
      GroupsChatTauri.getChats()
        .then(value => store.dispatch(chatsSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.chats]: String(error) }))),
  })

  // the mount load: the view history of the groups
  useEffectSingle({
    enabled: history === null,
    callback: () =>
      GroupsChatTauri.getGroupChatHistories()
        .then(value => store.dispatch(groupChatHistorySet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.history]: String(error) }))),
  })

  // the mount load: the routed group row
  useEffectSingle({
    keys: [groupChatId],
    enabled: Boolean(groupChatId) && !groupChat,
    callback: () =>
      GroupsChatTauri.getGroupChat(groupChatId)
        .then(value => store.dispatch(groupChatSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.group]: String(error) }))),
  })

  return {
    groupsChat,
    chats,
    history,
    groupChat,
    errors,
    ready:
      groupsChat !== null &&
      chats !== null &&
      history !== null &&
      (groupChatId ? groupChat !== null : true),
  }
}
