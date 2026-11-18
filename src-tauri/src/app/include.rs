// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'facts']
// INFO: The app command list: the chain entry of the invoke handler.

use tauri::ipc::Invoke;

use super::commands;

/// The command surface of the block: the chain entry.
pub(crate) fn handler() -> impl Fn(Invoke) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        commands::init,
        commands::get_app_info,
        commands::clipboard_write_text,
        commands::clipboard_write_image,
        commands::clipboard_write_files,
        commands::clipboard_clear,
        commands::clipboard_read,
        commands::open_in_browser,
        commands::attachment_stat,
    ]
}
