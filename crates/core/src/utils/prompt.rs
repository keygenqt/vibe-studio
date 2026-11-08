// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The wire role of a stored message and the prompt language name.

//! Small prompt-side converters: the wire role of a stored message
//! and the language name of a locale code.

use crate::ChatHistoryData;
use crate::ChatMessageType;

/// The wire role of a stored message by its sender kind: only the
/// model answers as the assistant.
pub(crate) fn history_role(message: &ChatHistoryData) -> String {
    if message.message_type == ChatMessageType::Assistant {
        "assistant".to_string()
    } else {
        "user".to_string()
    }
}

/// The prompt language name of a locale code; an unknown code reads
/// as English.
pub(crate) fn locale_language(locale: &str) -> &'static str {
    match locale {
        "ru" => "Russian",
        "cn" => "Chinese",
        _ => "English",
    }
}
