/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Providers read: the collection load and the copy for render.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { providersSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useProviders() {
  const providers = useSelector(s => s.providers.providers)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: providers === null,
    callback: async () => {
      setError(null)
      try {
        const value = await ProvidersTauri.getProviders()
        store.dispatch(providersSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    providers,
    error,
    ready: providers !== null,
  }
}
