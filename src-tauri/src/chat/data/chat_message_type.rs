// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The message sender wire type, mirrored from studio-core.

use serde::Serialize;

/// The sender kind of a message served to the shell: the mirror of
/// the core enum.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ChatMessageType {
    /// A message of the user.
    User,
    /// An answer of the model.
    Assistant,
    /// The compressed context base the session continues from.
    Compress,
}

impl From<studio_core::ChatMessageType> for ChatMessageType {
    fn from(kind: studio_core::ChatMessageType) -> Self {
        match kind {
            studio_core::ChatMessageType::User => Self::User,
            studio_core::ChatMessageType::Assistant => Self::Assistant,
            studio_core::ChatMessageType::Compress => Self::Compress,
        }
    }
}
