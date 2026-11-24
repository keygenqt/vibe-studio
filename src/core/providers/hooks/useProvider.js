/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Provider read: the routed provider row load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { providerSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useProvider(id) {
  const provider = useSelector(s => s.providers.provider[id] ?? null)
  const [error, setError] = useState(null)

  useEffectSingle({
    keys: [id],
    enabled: Boolean(id) && !provider,
    callback: async () => {
      setError(null)
      try {
        const value = await ProvidersTauri.getProvider(id)
        store.dispatch(providerSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    provider,
    error,
    ready: id ? provider !== null : true,
  }
}
