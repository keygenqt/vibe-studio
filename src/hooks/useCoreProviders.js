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
  const provider = useSelector(state =>
    providerId ? (state.providers.provider[providerId] ?? null) : null
  )
  // the block state keeps the flat models of all providers: the page
  // takes its slice by provider
  const models = useSelector(state => state.providers.models)
  const providerModels =
    providerId && models ? models.filter(model => model.provider_id === providerId) : null
  const model = useSelector(state => (modelId ? (state.providers.model[modelId] ?? null) : null))
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    Methods.get_providers_catalog().catch(setError)
    Methods.get_providers().catch(setError)
    // no argument = the whole table, the flat models of the block state
    Methods.get_provider_models().catch(setError)
    if (providerId) Methods.get_provider(providerId).catch(setError)
    if (modelId) Methods.get_provider_model(modelId).catch(setError)
  }, [providerId, modelId])

  return {
    catalog,
    providers,
    provider,
    models: providerModels,
    model,
    error,
    ready:
      error !== null ||
      (catalog !== null &&
        providers !== null &&
        models !== null &&
        (modelId ? model !== null : true)),
  }
}
