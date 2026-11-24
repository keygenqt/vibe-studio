/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Models read: the collection load, the copy and the optional provider filter.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { modelsSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useModels(providerId) {
  const models = useSelector(s => s.providers.models)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: models === null,
    callback: async () => {
      setError(null)
      try {
        const value = await ProvidersTauri.getProviderModels(null)
        store.dispatch(modelsSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    models: providerId
      ? models
        ? models.filter(model => model.providerId === providerId)
        : null
      : models,
    error,
    ready: models !== null,
  }
}
