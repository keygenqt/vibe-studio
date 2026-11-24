// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The attachment input wire type, mirrored from studio-core.

use serde::Deserialize;

/// One attached file as the shell sends it: a disk path, or a
/// clipboard image as base64 PNG.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum ChatAttachmentInput {
    /// A file on disk.
    File {
        /// The absolute path.
        path: String,
    },
    /// An image from the clipboard.
    Image {
        /// The image bytes, base64-encoded PNG.
        png: String,
    },
}

impl From<ChatAttachmentInput> for studio_core::ChatAttachmentInput {
    fn from(input: ChatAttachmentInput) -> Self {
        match input {
            ChatAttachmentInput::File { path } => Self::File {
                path: std::path::PathBuf::from(path),
            },
            ChatAttachmentInput::Image { png } => Self::Image { png },
        }
    }
}
