// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'facts']

use serde::Serialize;
use tauri::AppHandle;
use tauri::State;
use tauri::WebviewWindow;

use studio_core::ModelInfoData;
use studio_core::ProviderData;
use studio_core::ProviderInfoData;
use studio_core::ProviderModelData;
use studio_core::Store;
use studio_core::WorkspaceData;

use crate::emit_state;

/// Loads the shell environment.
#[tauri::command]
pub fn get_workspace(store: State<Store>) -> WorkspaceData {
    studio_core::get_workspace(&store)
}

/// Persists the shell environment; every mutation ends with the emit.
#[tauri::command]
pub fn save_workspace(
    window: WebviewWindow,
    store: State<Store>,
    workspace: WorkspaceData,
) -> Result<WorkspaceData, String> {
    studio_core::save_workspace(&store, &workspace).map_err(|e| e.to_string())?;
    emit_state(&window, workspace.clone());
    Ok(workspace)
}

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

/// Validates and persists; `id: null` inserts, otherwise updates.
/// Returns the stored row with its id.
#[tauri::command]
pub fn save_provider(store: State<Store>, provider: ProviderData) -> Result<ProviderData, String> {
    studio_core::save_provider(&store, &provider).map_err(|e| e.to_string())
}

/// Deletes the provider by id.
#[tauri::command]
pub fn delete_provider(store: State<Store>, id: i32) -> Result<(), String> {
    studio_core::delete_provider(&store, id).map_err(|e| e.to_string())
}

/// All models selected for a provider.
#[tauri::command]
pub fn get_provider_models(store: State<Store>, provider_id: i32) -> Vec<ProviderModelData> {
    studio_core::get_provider_models(&store, provider_id)
}

/// Loads one model by id.
#[tauri::command]
pub fn get_provider_model(store: State<Store>, id: i32) -> Result<ProviderModelData, String> {
    studio_core::get_provider_model(&store, id).map_err(|e| e.to_string())
}

/// Validates and persists the model row. Returns the stored row.
#[tauri::command]
pub fn save_provider_model(store: State<Store>, model: ProviderModelData) -> Result<ProviderModelData, String> {
    studio_core::save_provider_model(&store, &model).map_err(|e| e.to_string())
}

/// Persists the selection of the provider's model catalog. Returns
/// the fresh model list of the provider.
#[tauri::command]
pub async fn save_provider_models(
    store: State<'_, Store>,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<ProviderModelData>, String> {
    studio_core::save_provider_models(&store, provider_id, checked)
        .await
        .map_err(|e| e.to_string())
}

/// App version and debug flag.
#[derive(Serialize)]
pub struct AppInfoView {
    pub version: String,
    pub is_debug: bool,
}

#[tauri::command]
pub fn get_app_info(app: AppHandle) -> AppInfoView {
    AppInfoView {
        version: app.package_info().version.to_string(),
        is_debug: cfg!(debug_assertions),
    }
}

/// Fetches the live model catalog of a provider host.
#[tauri::command]
pub async fn get_provider_models_by_type(
    kind: String,
    host: String,
    api_key: Option<String>,
) -> Result<Vec<ModelInfoData>, String> {
    studio_core::get_provider_models_by_type(&kind, &host, api_key.as_deref())
        .await
        .map_err(|e| e.to_string())
}
