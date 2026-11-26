// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The draft items of the dropped paths, mirrored from studio-core.

use serde::Serialize;

/// One draft item served to the shell: a file on disk with its chip
/// facts — the file variant of the draft input's wire shape.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum AttachmentItemData {
    /// A file on disk.
    File {
        /// The absolute path.
        path: String,
        /// The image MIME by the header sniff; `None` = not an image.
        mime: Option<String>,
        /// The size on disk, bytes.
        size: i64,
    },
}

impl From<studio_core::AttachmentItemData> for AttachmentItemData {
    fn from(data: studio_core::AttachmentItemData) -> Self {
        Self::File {
            path: data.path,
            mime: data.mime,
            size: data.size,
        }
    }
}
