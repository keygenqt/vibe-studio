// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use tauri::LogicalSize;
use tauri::Manager;
use tauri::WebviewWindow;

use studio_core::Store;
use studio_core::workspace_load;
use studio_core::workspace_save;

/// Applies the saved window size, clamped to the window minimum.
pub fn restore(window: &WebviewWindow, store: &Store) {
    let workspace = workspace_load(store);
    if let (Some(width), Some(height)) = (workspace.window_width, workspace.window_height) {
        // negative values cannot appear — saved from clamped u32
        let (width, height) = clamp(window, width.max(0) as u32, height.max(0) as u32);
        let _ = window.set_size(LogicalSize::new(width, height));
    }
}

/// Persists the window size in logical units; a fullscreen or
/// maximized window keeps its last normal size.
pub fn save(window: &WebviewWindow, store: &Store) -> Result<(), String> {
    if window.is_fullscreen().unwrap_or(false) || window.is_maximized().unwrap_or(false) {
        return Ok(());
    }
    let scale = window.scale_factor().map_err(|e| e.to_string())?;
    let size = window.inner_size().map_err(|e| e.to_string())?;
    let logical = size.to_logical::<u32>(scale);
    let (width, height) = clamp(window, logical.width, logical.height);
    let mut workspace = workspace_load(store);
    workspace.window_width = Some(width as i32);
    workspace.window_height = Some(height as i32);
    workspace_save(store, &workspace).map_err(|e| e.to_string())
}

/// Clamps the logical size to the window minimum — the single
/// source of truth stays `tauri.conf.json`.
fn clamp(window: &WebviewWindow, width: u32, height: u32) -> (u32, u32) {
    let Some(config) = window
        .config()
        .app
        .windows
        .iter()
        .find(|config| config.label == window.label())
    else {
        return (width, height);
    };
    let width = width.max(config.min_width.unwrap_or(0.0) as u32);
    let height = height.max(config.min_height.unwrap_or(0.0) as u32);
    (width, height)
}
