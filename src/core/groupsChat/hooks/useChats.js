/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chats read: the collection load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { chatsSet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useChats() {
  const chats = useSelector(s => s.groupsChat.chats)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: chats === null,
    callback: async () => {
      setError(null)
      try {
        const value = await GroupsChatTauri.getChats()
        store.dispatch(chatsSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    chats,
    error,
    ready: chats !== null,
  }
}
