/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Groups chat read: the collection load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { groupsChatSet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useGroupsChat() {
  const groupsChat = useSelector(s => s.groupsChat.groupsChat)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: groupsChat === null,
    callback: async () => {
      setError(null)
      try {
        const value = await GroupsChatTauri.getGroupsChat()
        store.dispatch(groupsChatSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    groupsChat,
    error,
    ready: groupsChat !== null,
  }
}
