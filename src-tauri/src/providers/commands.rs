// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The providers block commands: providers, models and defaults.

use tauri::State;
use tauri::WebviewWindow;

use studio_core::ModelDefaultsData;
use studio_core::ProviderData;
use studio_core::ProviderInfoData;
use studio_core::ProviderModelData;
use studio_core::Store;

use super::data::providers_state::ProvidersData;
use crate::events::OkEmit;

/// Catalog of supported provider types for the add form.
#[tauri::command]
pub fn get_providers_catalog() -> Vec<ProviderInfoData> {
    studio_core::get_providers_catalog()
}

/// All configured providers.
#[tauri::command]
pub fn get_providers(store: State<Store>) -> Vec<ProviderData> {
    studio_core::get_providers(&store)
}

/// Loads one provider by id.
#[tauri::command]
pub fn get_provider(store: State<Store>, id: i32) -> Result<ProviderData, String> {
    studio_core::get_provider(&store, id).map_err(|e| e.to_string())
}

/// Validates and persists; `id: null` inserts, otherwise updates.
/// Emits and returns the fresh state of the providers block.
#[tauri::command]
pub fn save_provider(
    window: WebviewWindow,
    store: State<Store>,
    provider: ProviderData,
) -> Result<ProvidersData, String> {
    studio_core::save_provider(&store, &provider).map_err(|e| e.to_string())?;
    OkEmit(&window, ProvidersData::new(&store))
}

/// Deletes the provider by id; emits and returns the fresh state of
/// the providers block.
#[tauri::command]
pub fn delete_provider(window: WebviewWindow, store: State<Store>, id: i32) -> Result<ProvidersData, String> {
    studio_core::delete_provider(&store, id).map_err(|e| e.to_string())?;
    OkEmit(&window, ProvidersData::new(&store))
}

/// All models, optionally of one provider — `None` takes the whole
/// table behind the providers block state.
#[tauri::command]
pub fn get_provider_models(store: State<Store>, provider_id: Option<i32>) -> Vec<ProviderModelData> {
    studio_core::get_provider_models(&store, provider_id)
}

/// Loads one model by id.
#[tauri::command]
pub fn get_provider_model(store: State<Store>, id: i32) -> Result<ProviderModelData, String> {
    studio_core::get_provider_model(&store, id).map_err(|e| e.to_string())
}

/// The parameter spec of the model: the form builds its bounds from
/// it; the provider kind scopes the catalog family.
#[tauri::command]
pub fn get_model_defaults(provider: String, name: String) -> Result<ModelDefaultsData, String> {
    studio_core::get_model_defaults(&provider, &name).map_err(|e| e.to_string())
}

/// Validates and persists the model row. Emits and returns the
/// fresh state of the providers block.
#[tauri::command]
pub fn save_provider_model(
    window: WebviewWindow,
    store: State<Store>,
    model: ProviderModelData,
) -> Result<ProvidersData, String> {
    studio_core::save_provider_model(&store, &model).map_err(|e| e.to_string())?;
    OkEmit(&window, ProvidersData::new(&store))
}

/// Persists the selection of the provider's model catalog. Emits
/// and returns the fresh state of the providers block.
#[tauri::command]
pub async fn save_provider_models(
    window: WebviewWindow,
    store: State<'_, Store>,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<ProvidersData, String> {
    studio_core::save_provider_models(&store, provider_id, checked)
        .await
        .map_err(|e| e.to_string())?;
    OkEmit(&window, ProvidersData::new(&store))
}
