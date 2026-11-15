/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Groups chat read: the collection load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, groupsChatSet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useGroupsChat() {
  // the copy read: the groups collection
  const groupsChat = useSelector(s => s.groups_chat.groupsChat)
  const errors = useSelector(s => s.groups_chat.errors)

  // the mount load: the groups collection
  useEffectSingle({
    enabled: groupsChat === null,
    callback: () =>
      GroupsChatTauri.getGroupsChat()
        .then(value => store.dispatch(groupsChatSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.groups]: String(error) }))),
  })

  return {
    groupsChat,
    errors,
    ready: groupsChat !== null,
  }
}
