/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Group read: the routed group row load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, groupChatSet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useGroupChat(id) {
  // the copy read: the row paints for the routed group only
  const groupChat = useSelector(s => s.groups_chat.groupChat[id] ?? null)
  const errors = useSelector(s => s.groups_chat.errors)

  // the mount load: the routed group row
  useEffectSingle({
    keys: [id],
    enabled: Boolean(id) && !groupChat,
    callback: () =>
      GroupsChatTauri.getGroupChat(id)
        .then(value => store.dispatch(groupChatSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.group]: String(error) }))),
  })

  return {
    groupChat,
    errors,
    ready: id ? groupChat !== null : true,
  }
}
