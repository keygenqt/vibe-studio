// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The workspace block commands: the shell environment.

use tauri::State;
use tauri::WebviewWindow;

use studio_core::Store;
use studio_core::WorkspaceData;

use crate::events::OkEmit;

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
    OkEmit(&window, studio_core::get_workspace(&store))
}
