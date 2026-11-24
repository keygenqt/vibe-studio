// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'facts']
// INFO: The app block commands: shell actions and facts.

use tauri::AppHandle;
use tauri::State;

use studio_core::Store;

use crate::app::data::app_info::AppInfoData;
use crate::app::data::attachment_stat::AttachmentStatData;
use crate::app::data::clipboard_read::ClipboardRead;

/// The startup order: a killed process leaves `Progress` rows behind,
/// no stream can be alive on a fresh start — they read as cancelled.
#[tauri::command]
pub fn init(store: State<Store>) -> Result<(), String> {
    studio_core::init(&store).map_err(|e| e.to_string())
}

/// Serves the app version, debug flag and OS to the shell.
#[tauri::command]
pub fn get_app_info(app: AppHandle) -> AppInfoData {
    AppInfoData {
        version: app.package_info().version.to_string(),
        is_debug: cfg!(debug_assertions),
        os: std::env::consts::OS.to_string(),
    }
}

/// Sets the clipboard to plain text.
#[tauri::command]
pub fn clipboard_write_text(text: String) -> Result<(), String> {
    studio_core::clipboard_write_text(&text).map_err(|e| e.to_string())
}

/// Decodes base64 PNG and sets the clipboard image.
#[tauri::command]
pub fn clipboard_write_image(png: String) -> Result<(), String> {
    studio_core::clipboard_write_image(&png).map_err(|e| e.to_string())
}

/// Sets the clipboard to the file references.
#[tauri::command]
pub fn clipboard_write_files(paths: Vec<String>) -> Result<(), String> {
    let paths: Vec<std::path::PathBuf> = paths.iter().map(std::path::PathBuf::from).collect();
    studio_core::clipboard_write_files(&paths).map_err(|e| e.to_string())
}

/// Clears the system clipboard.
#[tauri::command]
pub fn clipboard_clear() -> Result<(), String> {
    studio_core::clipboard_clear().map_err(|e| e.to_string())
}

/// The clipboard content by priority: text → files → image; `null`
/// when the clipboard is empty or unsupported.
#[tauri::command]
pub fn clipboard_read() -> Option<ClipboardRead> {
    studio_core::clipboard_read().map(ClipboardRead::from)
}

/// Opens the link in the default browser; only `http` and `https`.
#[tauri::command]
pub fn open_in_browser(url: String) -> Result<(), String> {
    studio_core::open_in_browser(&url).map_err(|e| e.to_string())
}

/// The draft facts of a dropped path: the directory flag, the image
/// MIME sniffed from the header, the byte size.
#[tauri::command]
pub fn attachment_stat(path: String) -> Result<AttachmentStatData, String> {
    Ok(AttachmentStatData::from(studio_core::attachment_stat(&path)))
}
