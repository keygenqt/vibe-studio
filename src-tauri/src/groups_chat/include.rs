// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The groups chat command list: the chain entry of the invoke handler.

use tauri::ipc::Invoke;

use super::commands;

/// The command surface of the block: the chain entry.
pub(crate) fn handler() -> impl Fn(Invoke) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        commands::get_groups_chat,
        commands::get_group_chat,
        commands::save_group_chat,
        commands::delete_group_chat,
        commands::get_chats,
        commands::save_chat,
        commands::delete_chat,
        commands::get_group_chat_histories,
        commands::set_group_chat_view,
        commands::select_group_chat,
        commands::chat_regenerate_name,
    ]
}
