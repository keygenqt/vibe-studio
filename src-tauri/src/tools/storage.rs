// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use tauri::AppHandle;
use tauri::Manager;

use vibe_core::state::Settings;

pub fn load(app: &AppHandle) -> Settings {
    match app.path().app_data_dir() {
        Ok(dir) => vibe_core::storage::load(&dir),
        Err(_) => Settings::default(),
    }
}

pub fn save(app: &AppHandle, settings: &Settings) -> Result<(), anyhow::Error> {
    let dir = app.path().app_data_dir()?;
    vibe_core::storage::save(&dir, settings)
}
