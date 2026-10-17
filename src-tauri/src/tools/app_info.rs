// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use serde::Serialize;
use tauri::AppHandle;

#[derive(Serialize)]
pub struct AppInfoView {
    pub version: String,
    pub is_debug: bool,
}

#[tauri::command]
pub fn app_info(app: AppHandle) -> AppInfoView {
    AppInfoView {
        version: app.package_info().version.to_string(),
        is_debug: cfg!(debug_assertions),
    }
}
