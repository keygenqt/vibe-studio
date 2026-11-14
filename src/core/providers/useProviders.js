/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Providers read: the mount loads and the provider/model slices.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../hooks'
import store from '../store'
import {
  ERRORS,
  catalogSet,
  errorsSet,
  modelDefaultsSet,
  modelSet,
  modelsSet,
  providersSet,
} from './store'
import { ProvidersTauri } from './tauri'

export function useProviders({ providerId, modelId } = {}) {
  // the copy reads: the provider and model rows paint for the routed ids only
  const catalog = useSelector(s => s.providers.catalog)
  const providers = useSelector(s => s.providers.providers)
  const provider = useSelector(s => s.providers.provider[providerId] ?? null)
  const models = useSelector(s => s.providers.models)
  const model = useSelector(s => s.providers.model[modelId] ?? null)
  const defaults = useSelector(s => s.providers.defaults)
  const errors = useSelector(s => s.providers.errors)

  // the whole flat table is filtered on render: the provider slice
  const providerModels = providerId
    ? models
      ? models.filter(model => model.provider_id === providerId)
      : null
    : models

  // the mount load: the parameter spec of the routed model
  useEffectSingle({
    keys: [modelId],
    enabled: Boolean(model),
    callback: async () => {
      try {
        const row = store.getState().providers.providers.find(item => item.id === model.provider_id)
        const value = await ProvidersTauri.getModelDefaults(row, model.name)
        store.dispatch(modelDefaultsSet(value))
      } catch (error) {
        store.dispatch(errorsSet({ [ERRORS.defaults]: String(error) }))
      }
    },
  })

  // the mount load: the provider kinds catalog
  useEffectSingle({
    enabled: catalog === null,
    callback: () =>
      ProvidersTauri.getProvidersCatalog()
        .then(value => store.dispatch(catalogSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.catalog]: String(error) }))),
  })

  // the mount load: the providers collection
  useEffectSingle({
    enabled: providers === null,
    callback: () =>
      ProvidersTauri.getProviders()
        .then(value => store.dispatch(providersSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.providers]: String(error) }))),
  })

  // the mount load: the whole model table
  useEffectSingle({
    enabled: models === null,
    callback: () =>
      ProvidersTauri.getProviderModels(null)
        .then(value => store.dispatch(modelsSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.models]: String(error) }))),
  })

  // the mount load: the routed model row
  useEffectSingle({
    keys: [modelId],
    enabled: Boolean(modelId) && !model,
    callback: () =>
      ProvidersTauri.getProviderModel(modelId)
        .then(value => store.dispatch(modelSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.model]: String(error) }))),
  })

  return {
    catalog,
    providers,
    provider,
    models: providerModels,
    model,
    defaults,
    errors,
    ready:
      catalog !== null &&
      providers !== null &&
      models !== null &&
      (modelId ? model !== null : true),
  }
}
