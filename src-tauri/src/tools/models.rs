// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

use studio_core::ModelInfo;

/// Fetches the live model catalog of a provider host.
#[tauri::command]
pub async fn provider_models(kind: String, host: String, api_key: Option<String>) -> Result<Vec<ModelInfo>, String> {
    studio_core::provider_models(&kind, &host, api_key.as_deref())
        .await
        .map_err(|e| e.to_string())
}
