/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'

// last answers from Rust, kept only for rendering: pages take them as
// the initial state and revalidate on mount. Both caches are keyed:
// the model list by provider id, the model row by id.
const cache = { models: {}, model: {} }

export const models = {
  // cached model list by provider id, null when never fetched
  models_last_by_provider: providerId => cache.models[providerId] ?? null,
  // cached model row by id, null when never fetched
  model_last_by_id: id => cache.model[id] ?? null,
  // models selected for a provider
  models_get: async function (providerId) {
    const list = await invoke('get_provider_models', { providerId })
    cache.models[providerId] = list
    return list
  },
  model_get: async function (id) {
    const model = await invoke('get_provider_model', { id })
    cache.model[id] = model
    return model
  },
  // persists the full model row with the user-owned config patched over
  // it; config keys are snake_case, as the Rust struct expects
  model_save: async function (model, config) {
    return invoke('save_provider_model', { model: { ...model, ...config } })
  },
  // network sync: fetch the live catalog, upsert the facts, apply the
  // selection; returns the fresh model list
  models_sync: async function (providerId, checked) {
    return invoke('save_provider_models', { providerId, checked })
  },
}
