/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: The provider host catalog query: the live models by the provider row.
 */
import { useState } from 'react'

import { useEffectSingle } from '../../hooks'
import { ProvidersTauri } from './tauri'

export function useProviderModelsByType(provider) {
  // the live host catalog: a query result owned by the screen, not by the block copy
  const [models, setModels] = useState(null)
  const [error, setError] = useState(null)

  // the mount load: refetched per mount — the host catalog is live data
  useEffectSingle({
    keys: [provider?.id],
    enabled: Boolean(provider),
    callback: () =>
      ProvidersTauri.getProviderModelsByType(provider)
        .then(value => {
          setModels(value)
          setError(null)
        })
        .catch(err => setError(String(err))),
  })

  return { models, error }
}
