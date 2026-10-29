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
    const state = await invoke('save_provider', { provider })
    store.dispatch(catalogSet(state.catalog))
    store.dispatch(providersSet(state.providers))
    store.dispatch(modelsSet(state.models))
    return state
  },
  delete_provider: async function (id) {
    const state = await invoke('delete_provider', { id })
    store.dispatch(catalogSet(state.catalog))
    store.dispatch(providersSet(state.providers))
    store.dispatch(modelsSet(state.models))
    return state
  },
  get_provider_models_by_type: async function (provider) {
    return invoke('get_provider_models_by_type', {
      kind: provider.provider,
      host: provider.host,
      apiKey: provider.api_key ?? null,
    })
  },
  get_provider_models: async function (providerId) {
    // null takes the whole table — the flat models of the block state
    const list = await invoke('get_provider_models', { providerId: providerId ?? null })
    store.dispatch(modelsSet(list))
    return list
  },
  get_provider_model: async function (id) {
    const model = await invoke('get_provider_model', { id })
    store.dispatch(modelSet(model))
    return model
  },
  save_provider_model: async function (model, config) {
    const state = await invoke('save_provider_model', { model: { ...model, ...config } })
    store.dispatch(catalogSet(state.catalog))
    store.dispatch(providersSet(state.providers))
    store.dispatch(modelsSet(state.models))
    return state
  },
  save_provider_models: async function (providerId, checked) {
    const state = await invoke('save_provider_models', { providerId, checked })
    store.dispatch(catalogSet(state.catalog))
    store.dispatch(providersSet(state.providers))
    store.dispatch(modelsSet(state.models))
    return state
  },
}

export function providers_events() {
  return [
    listen('event-providers', event => {
      const state = event.payload.value
      store.dispatch(catalogSet(state.catalog))
      store.dispatch(providersSet(state.providers))
      store.dispatch(modelsSet(state.models))
    }),
  ]
}
