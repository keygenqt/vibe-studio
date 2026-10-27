/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 */
import * as React from 'react'
import { useSelector } from 'react-redux'

import { Methods } from '../modules'

export function useCoreProviders({ providerId, modelId } = {}) {
  const catalog = useSelector(state => state.providers.catalog)
  const providers = useSelector(state => state.providers.providers)
  const models = useSelector(state =>
    providerId ? (state.providers.models[providerId] ?? null) : null
  )
  const model = useSelector(state => (modelId ? (state.providers.model[modelId] ?? null) : null))
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    Methods.get_providers_catalog().catch(setError)
    Methods.get_providers().catch(setError)
    if (providerId) Methods.get_provider_models(providerId).catch(setError)
    if (modelId) Methods.get_provider_model(modelId).catch(setError)
  }, [providerId, modelId])

  return {
    catalog,
    providers,
    models,
    model,
    error,
    ready:
      error !== null ||
      (catalog !== null &&
        providers !== null &&
        (providerId ? models !== null : true) &&
        (modelId ? model !== null : true)),
  }
}
