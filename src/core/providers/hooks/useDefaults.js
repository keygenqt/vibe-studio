/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: The model defaults query: the parameter spec by the model and provider rows.
 */
import { useState } from 'react'

import { useEffectSingle } from '../../../hooks'
import { ProvidersTauri } from '../tauri'

export function useDefaults(model, provider) {
  const [defaults, setDefaults] = useState(null)
  const [error, setError] = useState(null)

  useEffectSingle({
    keys: [model?.id, provider?.id],
    enabled: Boolean(model) && Boolean(provider),
    callback: async () => {
      setError(null)
      try {
        setDefaults(await ProvidersTauri.getModelDefaults(provider.provider, model.name))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    defaults,
    error,
  }
}
