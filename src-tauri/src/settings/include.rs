// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The settings command list: the chain entry of the invoke handler.

use tauri::ipc::Invoke;

use super::commands;

/// The command surface of the block: the chain entry.
pub(crate) fn handler() -> impl Fn(Invoke) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        commands::get_settings,
        commands::save_settings,
        commands::get_system_theme,
    ]
}
