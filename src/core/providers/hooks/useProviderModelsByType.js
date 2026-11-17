/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: The provider host catalog query: the live models by the provider row.
 */
import { useState } from 'react'

import { useEffectSingle } from '../../../hooks'
import { ProvidersTauri } from '../tauri'

export function useProviderModelsByType(provider) {
  const [models, setModels] = useState(null)
  const [error, setError] = useState(null)

  useEffectSingle({
    keys: [provider?.id],
    enabled: Boolean(provider),
    callback: async () => {
      setError(null)
      try {
        setModels(await ProvidersTauri.getProviderModelsByType(provider))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    models,
    error,
  }
}
