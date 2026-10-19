// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use tauri::State;

use vibe_core::Store;
use vibe_core::Workspace;
use vibe_core::workspace_load;
use vibe_core::workspace_save;

#[tauri::command]
pub fn workspace_get(store: State<Store>) -> Workspace {
    workspace_load(&store)
}

/// Persists the composer height; the UI sends the resolved value.
#[tauri::command]
pub fn workspace_set_chat_input_size(store: State<Store>, value: u32) -> Result<Workspace, String> {
    let mut workspace = workspace_load(&store);
    workspace.chat_input_size = Some(value);
    workspace_save(&store, &workspace).map_err(|e| e.to_string())?;
    Ok(workspace)
}

/// Persists the sidebar size and collapsed flag.
#[tauri::command]
pub fn workspace_set_side_bar(store: State<Store>, size: u32, collapsed: bool) -> Result<Workspace, String> {
    let mut workspace = workspace_load(&store);
    workspace.side_bar_size = Some(size);
    workspace.side_bar_collapsed = collapsed;
    workspace_save(&store, &workspace).map_err(|e| e.to_string())?;
    Ok(workspace)
}
