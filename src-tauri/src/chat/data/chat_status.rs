// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The message status wire type, mirrored from studio-core.

use serde::Serialize;

/// The outcome status of a message served to the shell: the mirror
/// of the core enum.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ChatStatus {
    /// A user message, or a full answer of the model.
    Complete,
    /// The model stream is running: the text grows in the row.
    Progress,
    /// The stream was cut: by the user, or by a newer request.
    Cancelled,
    /// A failed request: the error text is kept as the message.
    Error,
}

impl From<studio_core::ChatStatus> for ChatStatus {
    fn from(status: studio_core::ChatStatus) -> Self {
        match status {
            studio_core::ChatStatus::Complete => Self::Complete,
            studio_core::ChatStatus::Progress => Self::Progress,
            studio_core::ChatStatus::Cancelled => Self::Cancelled,
            studio_core::ChatStatus::Error => Self::Error,
        }
    }
}
