// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme', 'facts']
// INFO: The app block: the startup, the OS environment and the shell actions.

//! The app block functions: the database startup, the OS theme and
//! the shell environment actions — clipboard, browser, attachments.

use std::path::Path;
use std::path::PathBuf;

use anyhow::Result;

use crate::ClipboardRead;
use crate::services::attachment;
use crate::services::attachment::AttachmentStatData;
use crate::services::clipboard;
use crate::services::theme;
use crate::services::theme::ThemeChoice;
use crate::utils;
use studio_states::Store;

/// Opens (or creates) the studio database in the given app data directory.
pub fn store_open(dir: &Path) -> Result<Store> {
    Store::open(&dir.join("vibe-studio.db"))
}

/// The startup order of the app: a killed process leaves `Progress`
/// rows behind, and no stream can be alive on a fresh start — they
/// all read as cancelled, the partial texts stay.
pub fn init(store: &Store) -> Result<()> {
    studio_states::cancel_progress_chat_histories(store)?;
    // a dead compress attempt must not stay in the history
    studio_states::delete_progress_chat_histories_compress(store)?;
    Ok(())
}

/// Detects the OS theme once — the startup value; changes come
/// through the watcher.
pub fn get_system_theme() -> ThemeChoice {
    theme::system_theme()
}

/// Calls the callback with the OS theme on every change. Spawns a
/// background watcher thread that lives for the app's lifetime.
pub fn listen_system_theme(on_change: impl Fn(ThemeChoice) + Send + 'static) -> Result<()> {
    theme::listen_system_theme(on_change)
}

/// Sets the clipboard to plain text.
pub fn clipboard_write_text(text: &str) -> Result<()> {
    clipboard::write_text(text)
}

/// Decodes base64 PNG and sets the clipboard image.
pub fn clipboard_write_image(png: &str) -> Result<()> {
    clipboard::write_image(png)
}

/// Sets the clipboard to the file references.
pub fn clipboard_write_files(paths: &[PathBuf]) -> Result<()> {
    clipboard::write_files(paths)
}

/// Clears the system clipboard.
pub fn clipboard_clear() -> Result<()> {
    clipboard::clear()
}

/// The clipboard content by priority: text → files → image; `None`
/// when the clipboard is empty or unsupported.
pub fn clipboard_read() -> Option<ClipboardRead> {
    clipboard::read_all()
}

/// Opens the link in the default browser; only `http` and `https`
/// pass.
pub fn open_in_browser(url: &str) -> Result<()> {
    utils::open_in_browser(url)
}

/// The draft facts of a dropped path: the directory flag, the image
/// MIME sniffed from the header, the byte size.
pub fn attachment_stat(path: &str) -> AttachmentStatData {
    attachment::stat(path)
}
