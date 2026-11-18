// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat command list: the chain entry of the invoke handler.

use tauri::ipc::Invoke;

use super::commands;

/// The command surface of the block: the chain entry.
pub(crate) fn handler() -> impl Fn(Invoke) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        commands::chat_get_history,
        commands::chat_send_message,
        commands::chat_cancel_send,
        commands::chat_set_message_show_type,
        commands::chat_set_message_collapsed,
        commands::chat_delete_message,
        commands::chat_resend_message,
        commands::chat_translate_message,
        commands::chat_compress_message,
    ]
}
