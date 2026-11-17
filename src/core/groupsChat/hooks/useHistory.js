/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Group history read: the view history load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { historySet } from '../store'
import { GroupsChatTauri } from '../tauri'

export function useHistory() {
  const history = useSelector(s => s.groupsChat.history)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: history === null,
    callback: async () => {
      setError(null)
      try {
        const value = await GroupsChatTauri.getGroupChatHistories()
        store.dispatch(historySet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    history,
    error,
    ready: history !== null,
  }
}
