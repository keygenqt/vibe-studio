// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use anyhow::Result;
use tauri::AppHandle;
use tauri::Manager;

use vibe_core::Store;

/// Opens (or creates) the state store in the app data directory.
pub fn store(app: &AppHandle) -> Result<Store> {
    let dir = app.path().app_data_dir()?;
    vibe_core::store_open(&dir)
}
