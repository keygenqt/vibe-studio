/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chats read: the collection load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, chatsSet, errorsSet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useChats() {
  // the copy read: the chats collection
  const chats = useSelector(s => s.groups_chat.chats)
  const errors = useSelector(s => s.groups_chat.errors)

  // the mount load: the chats collection
  useEffectSingle({
    enabled: chats === null,
    callback: () =>
      GroupsChatTauri.getChats()
        .then(value => store.dispatch(chatsSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.chats]: String(error) }))),
  })

  return {
    chats,
    errors,
    ready: chats !== null,
  }
}
