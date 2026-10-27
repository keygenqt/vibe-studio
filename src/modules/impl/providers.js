/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import {
  catalogSet,
  modelSet,
  modelsSet,
  providerSet,
  providersSet,
} from '../../store/impl/providers'

export const providers = {
  get_providers_catalog: async function () {
    const list = await invoke('get_providers_catalog', {})
    store.dispatch(catalogSet(list))
    return list
  },
  get_providers: async function () {
    const list = await invoke('get_providers', {})
    store.dispatch(providersSet(list))
    return list
  },
  get_provider: async function (id) {
    const provider = await invoke('get_provider', { id })
    store.dispatch(providerSet(provider))
    return provider
  },
  save_provider: async function (provider) {
    const saved = await invoke('save_provider', { provider })
    await providers.get_providers()
    return saved
  },
  delete_provider: async function (id) {
    await invoke('delete_provider', { id })
    store.dispatch(modelsSet({ providerId: id, models: [] }))
    await providers.get_providers()
  },
  get_provider_models_by_type: async function (provider) {
    return invoke('get_provider_models_by_type', {
      kind: provider.provider,
      host: provider.host,
      apiKey: provider.api_key ?? null,
    })
  },
  get_provider_models: async function (providerId) {
    const list = await invoke('get_provider_models', { providerId })
    store.dispatch(modelsSet({ providerId, models: list }))
    return list
  },
  get_provider_model: async function (id) {
    const model = await invoke('get_provider_model', { id })
    store.dispatch(modelSet(model))
    return model
  },
  save_provider_model: async function (model, config) {
    const saved = await invoke('save_provider_model', { model: { ...model, ...config } })
    store.dispatch(modelSet(saved))
    await providers.get_provider_models(saved.provider_id)
    return saved
  },
  save_provider_models: async function (providerId, checked) {
    const models = await invoke('save_provider_models', { providerId, checked })
    store.dispatch(modelsSet({ providerId, models }))
    return models
  },
}

export function providers_events() {
  return [
    listen('event-providers', event => {
      const { key, value } = event.payload
      if (key === 'providers') {
        store.dispatch(providersSet(value))
      }
      if (key === 'provider_models') {
        const providerId = value[0]?.provider_id
        if (providerId !== undefined) {
          store.dispatch(modelsSet({ providerId, models: value }))
        }
      }
    }),
  ]
}
