// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The providers block commands: providers, models and defaults.

use tauri::State;
use tauri::WebviewWindow;

use studio_core::Store;

use super::data::model_defaults_data::ModelDefaultsData;
use super::data::model_info_data::ModelInfoData;
use super::data::provider_data::ProviderData;
use super::data::provider_info_data::ProviderInfoData;
use super::data::provider_model_data::ProviderModelData;
use super::data::providers_state::ProvidersData;
use crate::events::OkEmit;

/// Catalog of supported provider types for the add form.
#[tauri::command]
pub fn get_providers_catalog() -> Vec<ProviderInfoData> {
    studio_core::get_providers_catalog()
        .into_iter()
        .map(ProviderInfoData::from)
        .collect()
}

/// All configured providers.
#[tauri::command]
pub fn get_providers(store: State<Store>) -> Vec<ProviderData> {
    studio_core::get_providers(&store)
        .into_iter()
        .map(ProviderData::from)
        .collect()
}

/// Loads one provider by id.
#[tauri::command]
pub fn get_provider(store: State<Store>, id: i32) -> Result<ProviderData, String> {
    studio_core::get_provider(&store, id)
        .map(ProviderData::from)
        .map_err(|e| e.to_string())
}

/// Validates and persists; `id: null` inserts, otherwise updates.
/// Emits and returns the fresh state of the providers block.
#[tauri::command]
pub fn save_provider(
    window: WebviewWindow,
    store: State<Store>,
    provider: ProviderData,
) -> Result<ProvidersData, String> {
    studio_core::save_provider(&store, &studio_core::ProviderData::from(&provider)).map_err(|e| e.to_string())?;
    OkEmit(&window, ProvidersData::new(&store))
}

/// Deletes the provider by id; emits and returns the fresh state of
/// the providers block.
#[tauri::command]
pub fn delete_provider(window: WebviewWindow, store: State<Store>, id: i32) -> Result<ProvidersData, String> {
    studio_core::delete_provider(&store, id).map_err(|e| e.to_string())?;
    OkEmit(&window, ProvidersData::new(&store))
}

/// Fetches the live model catalog of a provider host.
#[tauri::command]
pub async fn get_provider_models_by_type(
    kind: String,
    host: String,
    api_key: Option<String>,
    project: Option<String>,
) -> Result<Vec<ModelInfoData>, String> {
    studio_core::get_provider_models_by_type(&kind, &host, api_key.as_deref(), project.as_deref())
        .await
        .map(|models| models.into_iter().map(ModelInfoData::from).collect())
        .map_err(|e| e.to_string())
}

/// All models, optionally of one provider — `None` takes the whole
/// table behind the providers block state.
#[tauri::command]
pub fn get_provider_models(store: State<Store>, provider_id: Option<i32>) -> Vec<ProviderModelData> {
    studio_core::get_provider_models(&store, provider_id)
        .into_iter()
        .map(ProviderModelData::from)
        .collect()
}

/// Loads one model by id.
#[tauri::command]
pub fn get_provider_model(store: State<Store>, id: i32) -> Result<ProviderModelData, String> {
    studio_core::get_provider_model(&store, id)
        .map(ProviderModelData::from)
        .map_err(|e| e.to_string())
}

/// The parameter spec of the model: the form builds its bounds from
/// it; the provider kind scopes the catalog family.
#[tauri::command]
pub fn get_model_defaults(provider: String, name: String) -> Result<ModelDefaultsData, String> {
    studio_core::get_model_defaults(&provider, &name)
        .map(ModelDefaultsData::from)
        .map_err(|e| e.to_string())
}

/// Validates and persists the model row. Emits and returns the
/// fresh state of the providers block.
#[tauri::command]
pub fn save_provider_model(
    window: WebviewWindow,
    store: State<Store>,
    model: ProviderModelData,
) -> Result<ProvidersData, String> {
    studio_core::save_provider_model(&store, &studio_core::ProviderModelData::from(&model))
        .map_err(|e| e.to_string())?;
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
