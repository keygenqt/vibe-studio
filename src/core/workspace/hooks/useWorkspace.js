/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Workspace read: the shell copy load and the fields for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { workspaceSet } from '../store'
import { WorkspaceTauri } from '../tauri'

export function useWorkspace() {
  const raw = useSelector(s => s.workspace)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: true,
    callback: async () => {
      setError(null)
      try {
        const value = await WorkspaceTauri.get()
        store.dispatch(workspaceSet(value))
        setReady(true)
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    ...raw,
    ready,
    error,
  }
}
