/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Model read: the routed model row load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { modelSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useModel(id) {
  const model = useSelector(s => s.providers.model[id] ?? null)
  const [error, setError] = useState(null)

  useEffectSingle({
    keys: [id],
    enabled: Boolean(id) && !model,
    callback: async () => {
      setError(null)
      try {
        const value = await ProvidersTauri.getProviderModel(id)
        store.dispatch(modelSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    model,
    error,
    ready: id ? model !== null : true,
  }
}
