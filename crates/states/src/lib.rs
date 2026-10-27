// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Application state persistence on SQLite.
//!
//! Owns the database (schema, migrations) and the state structures
//! saved in it. The flat functions below are the crate's public API;
//! UI shells talk to this crate through `studio-core` only.

use anyhow::Result;

pub(crate) mod data;
pub(crate) mod db;

pub use data::group_chat::GroupChatData;
pub use data::provider::ProviderData;
pub use data::provider_model::ProviderModelData;
pub use data::workspace::WorkspaceData;
pub use db::store::Store;

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

/// All models of a provider.
pub fn get_provider_models(store: &Store, provider_id: i32) -> Result<Vec<ProviderModelData>> {
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

/// All chat groups.
pub fn get_groups_chat(store: &Store) -> Result<Vec<GroupChatData>> {
    store.get_groups_chat()
}

/// Loads one group by id.
pub fn get_group_chat(store: &Store, id: i32) -> Result<GroupChatData> {
    store.get_group_chat(id)
}

/// Inserts a new group (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_group_chat(store: &Store, group_chat: &GroupChatData) -> Result<GroupChatData> {
    store.save_group_chat(group_chat)
}

/// Deletes the group with the given id, returns affected rows.
pub fn delete_group_chat(store: &Store, id: i32) -> Result<usize> {
    store.delete_group_chat(id)
}

/// Loads the shell environment; a missing row falls back to `Default`.
pub fn get_workspace(store: &Store) -> Result<WorkspaceData> {
    store.get_workspace()
}

/// Persists the shell environment as the single row, returns it.
pub fn save_workspace(store: &Store, workspace: &WorkspaceData) -> Result<WorkspaceData> {
    store.save_workspace(workspace)
}
