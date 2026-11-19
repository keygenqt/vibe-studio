// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The bubble view wire type, mirrored from studio-core.

use serde::{Deserialize, Serialize};

/// The message bubble view served to the shell: which artifact the
/// bubble shows.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ChatShowType {
    /// The message text itself.
    Text,
    /// The translation of the text.
    Translate,
    /// The brief summary of the text.
    Summary,
    /// The model reasoning behind the answer.
    Thinking,
}

impl From<studio_core::ChatShowType> for ChatShowType {
    fn from(kind: studio_core::ChatShowType) -> Self {
        match kind {
            studio_core::ChatShowType::Text => Self::Text,
            studio_core::ChatShowType::Translate => Self::Translate,
            studio_core::ChatShowType::Summary => Self::Summary,
            studio_core::ChatShowType::Thinking => Self::Thinking,
        }
    }
}

impl From<ChatShowType> for studio_core::ChatShowType {
    fn from(kind: ChatShowType) -> Self {
        match kind {
            ChatShowType::Text => Self::Text,
            ChatShowType::Translate => Self::Translate,
            ChatShowType::Summary => Self::Summary,
            ChatShowType::Thinking => Self::Thinking,
        }
    }
}
