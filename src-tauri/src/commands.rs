// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'facts']

use tauri::AppHandle;
use tauri::State;
use tauri::WebviewWindow;

use studio_core::ModelInfoData;
use studio_core::ProviderData;
use studio_core::ProviderInfoData;
use studio_core::ProviderModelData;
use studio_core::Store;
use studio_core::WorkspaceData;

use crate::data::app_info::AppInfoData;
use crate::data::event_data::EventData;
use crate::data::event_data::EventKey;
use crate::events::emit_event_providers;
use crate::events::emit_event_workspace;

// ─────────────────────────────────────────────
// Workspace
// ─────────────────────────────────────────────

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
    let saved = studio_core::save_workspace(&store, &workspace).map_err(|e| e.to_string())?;
    emit_event_workspace(&window, EventData::new(EventKey::Workspace, &saved));
    Ok(saved)
}

// ─────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────

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
/// Returns the stored row and broadcasts the fresh providers list.
#[tauri::command]
pub fn save_provider(
    window: WebviewWindow,
    store: State<Store>,
    provider: ProviderData,
) -> Result<ProviderData, String> {
    let saved = studio_core::save_provider(&store, &provider).map_err(|e| e.to_string())?;
    emit_event_providers(
        &window,
        EventData::new(EventKey::Providers, &studio_core::get_providers(&store)),
    );
    Ok(saved)
}

/// Deletes the provider by id and broadcasts the fresh providers list.
#[tauri::command]
pub fn delete_provider(window: WebviewWindow, store: State<Store>, id: i32) -> Result<(), String> {
    studio_core::delete_provider(&store, id).map_err(|e| e.to_string())?;
    emit_event_providers(
        &window,
        EventData::new(EventKey::Providers, &studio_core::get_providers(&store)),
    );
    Ok(())
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

/// Validates and persists the model row. Returns the stored row and
/// broadcasts the fresh model list of its provider.
#[tauri::command]
pub fn save_provider_model(
    window: WebviewWindow,
    store: State<Store>,
    model: ProviderModelData,
) -> Result<ProviderModelData, String> {
    let saved = studio_core::save_provider_model(&store, &model).map_err(|e| e.to_string())?;
    emit_event_providers(
        &window,
        EventData::new(
            EventKey::ProviderModels,
            &studio_core::get_provider_models(&store, saved.provider_id),
        ),
    );
    Ok(saved)
}

/// Persists the selection of the provider's model catalog. Returns
/// the fresh model list of the provider.
#[tauri::command]
pub async fn save_provider_models(
    window: WebviewWindow,
    store: State<'_, Store>,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<ProviderModelData>, String> {
    let models = studio_core::save_provider_models(&store, provider_id, checked)
        .await
        .map_err(|e| e.to_string())?;
    emit_event_providers(&window, EventData::new(EventKey::ProviderModels, &models));
    Ok(models)
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

/// The current OS theme — the startup value for the shell.
#[tauri::command]
pub fn get_system_theme() -> String {
    studio_core::get_system_theme().as_str().to_string()
}

/// Serves the app version and debug flag to the shell.
#[tauri::command]
pub fn get_app_info(app: AppHandle) -> AppInfoData {
    AppInfoData {
        version: app.package_info().version.to_string(),
        is_debug: cfg!(debug_assertions),
    }
}
