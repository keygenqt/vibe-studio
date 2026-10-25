// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use tauri::State;

use studio_core::Model;
use studio_core::ModelConfig;
use studio_core::Store;
use studio_core::models_load;

/// All models selected for a provider, ordered by name.
#[tauri::command]
pub fn models_get(store: State<Store>, provider_id: i32) -> Vec<Model> {
    models_load(&store, provider_id)
}

/// Loads one model by id.
#[tauri::command]
pub fn model_get(store: State<Store>, id: i32) -> Result<Model, String> {
    studio_core::model_load(&store, id).map_err(|e| e.to_string())
}

/// Clamps and persists the user-owned config. Returns the stored row.
#[tauri::command]
pub fn model_save(store: State<Store>, id: i32, config: ModelConfig) -> Result<Model, String> {
    studio_core::model_save(&store, id, &config).map_err(|e| e.to_string())
}

/// Persists the selection of the provider's model catalog. Returns
/// the fresh model list of the provider.
#[tauri::command]
pub async fn models_sync(
    store: State<'_, Store>,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<Model>, String> {
    studio_core::models_sync(&store, provider_id, checked)
        .await
        .map_err(|e| e.to_string())
}
