/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Group read: the routed group row load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { groupChatSet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useGroupChat(id) {
  const groupChat = useSelector(s => s.groupsChat.groupChat[id] ?? null)
  const [error, setError] = useState(null)

  useEffectSingle({
    keys: [id],
    enabled: Boolean(id) && !groupChat,
    callback: async () => {
      setError(null)
      try {
        const value = await GroupsChatTauri.getGroupChat(id)
        store.dispatch(groupChatSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    groupChat,
    error,
    ready: id ? groupChat !== null : true,
  }
}
