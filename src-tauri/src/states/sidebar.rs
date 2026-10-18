// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use tauri::State;

use vibe_core::Sidebar;
use vibe_core::Store;
use vibe_core::sidebar;
use vibe_core::sidebar_load;
use vibe_core::sidebar_save;

#[tauri::command]
pub fn sidebar_get(store: State<Store>) -> Sidebar {
    sidebar_load(&store)
}

/// Width is clamped to the allowed range; returns the clamped value.
#[tauri::command]
pub fn sidebar_set(store: State<Store>, collapsed: bool, width: u32) -> Result<Sidebar, String> {
    let sidebar = sidebar(collapsed, width);
    sidebar_save(&store, &sidebar).map_err(|e| e.to_string())?;
    Ok(sidebar)
}
