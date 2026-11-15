/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Group history read: the view history load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, groupChatHistorySet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useHistory() {
  // the copy read: the view history of the groups
  const history = useSelector(s => s.groups_chat.history)
  const errors = useSelector(s => s.groups_chat.errors)

  // the mount load: the view history of the groups
  useEffectSingle({
    enabled: history === null,
    callback: () =>
      GroupsChatTauri.getGroupChatHistories()
        .then(value => store.dispatch(groupChatHistorySet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.history]: String(error) }))),
  })

  return {
    history,
    errors,
    ready: history !== null,
  }
}
