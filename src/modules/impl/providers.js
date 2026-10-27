/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import store from '../../store'
import { catalogSet, modelSet, modelsSet, providersSet } from '../../store/impl/providers'

export const providers = {
  // catalog: supported provider types for the add form
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
  // insert on id = null, update otherwise; the read afterwards is the
  // delivery confirmation — the caller navigates against a fresh
  // store, the event broadcast only repeats it
  save_provider: async function (provider) {
    const saved = await invoke('save_provider', { provider })
    await providers.get_providers()
    return saved
  },
  delete_provider: async function (id) {
    await invoke('delete_provider', { id })
    // the provider is gone, its model copy has no owner — drop it
    store.dispatch(modelsSet({ providerId: id, models: [] }))
    await providers.get_providers()
  },
  // live model catalog of a provider row (kind, host, api_key);
  // network answer, not a stored state — lands nowhere
  get_provider_models_by_type: async function (provider) {
    return invoke('get_provider_models_by_type', {
      kind: provider.provider,
      host: provider.host,
      apiKey: provider.api_key ?? null,
    })
  },
  // models selected for a provider
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
  // persists the full model row with the user-owned config patched
  // over it; the saved row and the fresh model list land in the store
  // — the event broadcast only repeats the list
  save_provider_model: async function (model, config) {
    const saved = await invoke('save_provider_model', { model: { ...model, ...config } })
    store.dispatch(modelSet(saved))
    await providers.get_provider_models(saved.provider_id)
    return saved
  },
  // network sync: fetch the live catalog, upsert the facts, apply the
  // selection; the fresh model list comes back and lands in the store
  save_provider_models: async function (providerId, checked) {
    const models = await invoke('save_provider_models', { providerId, checked })
    store.dispatch(modelsSet({ providerId, models }))
    return models
  },
}

// the block's Rust channel, bound once for the app lifetime; the key
// routes the payload: `providers` — the fresh providers list,
// `provider_models` — the fresh model list of one provider, the
// provider itself is taken from the rows
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
