// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The settings block commands: the preferences and the system theme.

use tauri::State;
use tauri::WebviewWindow;

use studio_core::SettingsData;
use studio_core::Store;

use crate::events::OkEmit;

/// Loads the user preferences; model references come resolved —
/// a gone model reads as `null`.
#[tauri::command]
pub fn get_settings(store: State<Store>) -> SettingsData {
    studio_core::get_settings(&store)
}

/// Persists the user preferences; every mutation ends with the emit.
#[tauri::command]
pub fn save_settings(
    window: WebviewWindow,
    store: State<Store>,
    settings: SettingsData,
) -> Result<SettingsData, String> {
    studio_core::save_settings(&store, &settings).map_err(|e| e.to_string())?;
    OkEmit(&window, studio_core::get_settings(&store))
}

/// The current OS theme — the startup value for the shell.
#[tauri::command]
pub fn get_system_theme() -> String {
    studio_core::get_system_theme().as_str().to_string()
}
