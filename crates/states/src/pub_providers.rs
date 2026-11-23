// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The provider connections and their model catalogs, published as the flat API.

//! The provider connections and their model catalogs: the flat API
//! over the `providers` and `models` tables.

use anyhow::Result;

use crate::data::models::ProviderModelData;
use crate::data::providers::ProviderData;
use crate::db::store::Store;

/// All configured providers.
pub fn get_providers(store: &Store) -> Result<Vec<ProviderData>> {
    store.get_providers()
}

/// Loads one provider by id.
pub fn get_provider(store: &Store, id: i32) -> Result<ProviderData> {
    store.get_provider(id)
}

/// Inserts a new provider (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_provider(store: &Store, provider: &ProviderData) -> Result<ProviderData> {
    store.save_provider(provider)
}

/// Deletes the provider with the given id, returns affected rows.
pub fn delete_provider(store: &Store, id: i32) -> Result<usize> {
    store.delete_provider(id)
}

/// All models, optionally of one provider — `None` takes the whole
/// table behind the providers block state.
pub fn get_provider_models(store: &Store, provider_id: Option<i32>) -> Result<Vec<ProviderModelData>> {
    store.get_provider_models(provider_id)
}

/// Loads one model by id.
pub fn get_provider_model(store: &Store, id: i32) -> Result<ProviderModelData> {
    store.get_provider_model(id)
}

/// Inserts a new model (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_provider_model(store: &Store, model: &ProviderModelData) -> Result<ProviderModelData> {
    store.save_provider_model(model)
}

/// Persists the selection: upserts the given models with the stored config, prunes the rest; returns the fresh list.
pub fn save_provider_models(
    store: &Store,
    provider_id: i32,
    models: &[ProviderModelData],
) -> Result<Vec<ProviderModelData>> {
    store.save_provider_models(provider_id, models)
}
