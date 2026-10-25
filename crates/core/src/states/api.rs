// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! State features: persisted application state over the store.

use anyhow::Result;
use std::path::Path;

pub use studio_cluster::ProviderInfo;
pub use studio_states::Model;
pub use studio_states::ModelConfig;
pub use studio_states::Provider;
pub use studio_states::Store;
pub use studio_states::Workspace;

/// Opens (or creates) the database in the given app data directory.
/// The file name lives in `studio-states` — the shell never knows it.
pub fn store_open(dir: &Path) -> Result<Store> {
    super::store::store_open(dir)
}

/// Loads the shell environment; a missing row falls back to `Default`
/// — untouched values stay `None`.
pub fn workspace_load(store: &Store) -> Workspace {
    super::workspace::workspace_load(store)
}

/// Persists the shell environment.
pub fn workspace_save(store: &Store, workspace: &Workspace) -> Result<()> {
    super::workspace::workspace_save(store, workspace)
}

/// Catalog of supported provider types — the single source for the
/// add form and for validation.
pub fn providers_catalog() -> Vec<ProviderInfo> {
    studio_cluster::providers()
}

/// All configured providers; a store error yields an empty list.
pub fn providers_load(store: &Store) -> Vec<Provider> {
    super::provider::providers_load(store)
}

/// Validates and persists the provider; insert on id = 0, update
/// otherwise. Returns the stored row with its id.
pub fn provider_save(store: &Store, provider: &Provider) -> Result<Provider> {
    super::provider::provider_save(store, provider)
}

/// Deletes the provider by id.
pub fn provider_delete(store: &Store, id: i32) -> Result<()> {
    super::provider::provider_delete(store, id)
}

/// All models of a provider, ordered by name; a store error yields an
/// empty list.
pub fn models_load(store: &Store, provider_id: i32) -> Vec<Model> {
    super::models::models_load(store, provider_id)
}

/// Loads one model by id.
pub fn model_load(store: &Store, id: i32) -> Result<Model> {
    super::models::model_load(store, id)
}

/// Clamps the user-owned config and persists it. Returns the stored
/// row.
pub fn model_save(store: &Store, id: i32, config: &ModelConfig) -> Result<Model> {
    super::models::model_save(store, id, config)
}

/// Syncs the provider's catalog with the live host and applies the
/// selection. Returns the fresh model list of the provider.
pub async fn models_sync(store: &Store, provider_id: i32, checked: Vec<String>) -> Result<Vec<Model>> {
    super::models::models_sync(store, provider_id, checked).await
}
