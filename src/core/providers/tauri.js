/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Providers Tauri commands and its state event channel.
 */
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export const ProvidersTauri = {
  getProvidersCatalog: async function () {
    return invoke('get_providers_catalog', {})
  },
  getProviders: async function () {
    return invoke('get_providers', {})
  },
  getProvider: async function (id) {
    return invoke('get_provider', { id })
  },
  saveProvider: async function (provider) {
    return invoke('save_provider', { provider })
  },
  deleteProvider: async function (id) {
    return invoke('delete_provider', { id })
  },
  getProviderModelsByType: async function (provider) {
    return invoke('get_provider_models_by_type', {
      kind: provider.provider,
      host: provider.host,
      apiKey: provider.api_key ?? null,
      project: provider.project ?? null,
    })
  },
  getProviderModels: async function (providerId) {
    return invoke('get_provider_models', { providerId: providerId ?? null })
  },
  getProviderModel: async function (id) {
    return invoke('get_provider_model', { id })
  },
  getModelDefaults: async function (provider, name) {
    return invoke('get_model_defaults', { provider, name })
  },
  saveProviderModel: async function (model, config) {
    return invoke('save_provider_model', { model: { ...model, ...config } })
  },
  saveProviderModels: async function (providerId, checked) {
    return invoke('save_provider_models', { providerId, checked })
  },
  onState: function (callback) {
    return listen('event-providers', event => {
      callback(event.payload.value)
    })
  },
}
