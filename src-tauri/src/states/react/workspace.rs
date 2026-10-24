// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']

use tauri::State;
use tauri::WebviewWindow;

use studio_core::Store;
use studio_core::ThemeChoice;
use studio_core::Workspace;
use studio_core::workspace_load;
use studio_core::workspace_save;

use crate::states::react::view;

#[tauri::command]
pub fn workspace_get(store: State<Store>) -> Workspace {
    workspace_load(&store)
}

/// Persists the composer height; the UI sends the resolved value.
#[tauri::command]
pub fn workspace_set_chat_input_size(
    window: WebviewWindow,
    store: State<Store>,
    value: i32,
) -> Result<Workspace, String> {
    if value <= 0 {
        return Err(String::from("Size must be positive."));
    }
    let mut workspace = workspace_load(&store);
    workspace.chat_input_size = Some(value);
    persist(&window, &store, workspace)
}

/// Persists the sidebar size and collapsed flag.
#[tauri::command]
pub fn workspace_set_side_bar(
    window: WebviewWindow,
    store: State<Store>,
    size: i32,
    collapsed: bool,
) -> Result<Workspace, String> {
    if size <= 0 {
        return Err(String::from("Size must be positive."));
    }
    let mut workspace = workspace_load(&store);
    workspace.side_bar_size = Some(size);
    workspace.side_bar_collapsed = collapsed;
    persist(&window, &store, workspace)
}

/// Persists the theme choice: "light" | "dark" | "system".
#[tauri::command]
pub fn workspace_set_theme(
    window: WebviewWindow,
    store: State<Store>,
    theme: ThemeChoice,
) -> Result<Workspace, String> {
    let mut workspace = workspace_load(&store);
    workspace.theme = theme.as_str().to_string();
    persist(&window, &store, workspace)
}

/// Saves and broadcasts — every mutation ends with the emit.
fn persist(window: &WebviewWindow, store: &Store, workspace: Workspace) -> Result<Workspace, String> {
    workspace_save(store, &workspace).map_err(|e| e.to_string())?;
    view::emit_state(window, workspace.clone());
    Ok(workspace)
}
