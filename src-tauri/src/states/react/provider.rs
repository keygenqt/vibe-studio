// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use tauri::State;

use studio_core::{Provider, ProviderInfo, Store, providers_load};

/// Catalog of supported provider types for the add form.
#[tauri::command]
pub fn providers_catalog() -> Vec<ProviderInfo> {
    studio_core::providers_catalog()
}

/// All configured providers, ordered by id.
#[tauri::command]
pub fn providers_get(store: State<Store>) -> Vec<Provider> {
    providers_load(&store)
}

/// Validates and persists; insert on id = 0, update otherwise.
/// Returns the stored row with its id.
#[tauri::command]
pub fn provider_save(store: State<Store>, provider: Provider) -> Result<Provider, String> {
    studio_core::provider_save(&store, &provider).map_err(|e| e.to_string())
}

/// Deletes the provider by id.
#[tauri::command]
pub fn provider_delete(store: State<Store>, id: i32) -> Result<(), String> {
    studio_core::provider_delete(&store, id).map_err(|e| e.to_string())
}
