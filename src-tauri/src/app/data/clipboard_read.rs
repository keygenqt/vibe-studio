// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The clipboard read answer, mirrored from studio-core.

use serde::Serialize;

/// The clipboard content by its kind served to the shell: the
/// priority text → files → image is resolved in core.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum ClipboardRead {
    /// Plain text.
    Text {
        /// The clipboard text.
        text: String,
    },
    /// File references: a file-manager copy or `file://` text.
    Files {
        /// The referenced paths.
        paths: Vec<String>,
    },
    /// Pixel image as base64 PNG.
    Image {
        /// The image bytes, base64-encoded PNG.
        png: String,
    },
}

impl From<studio_core::ClipboardRead> for ClipboardRead {
    fn from(read: studio_core::ClipboardRead) -> Self {
        match read {
            studio_core::ClipboardRead::Text { text } => Self::Text { text },
            studio_core::ClipboardRead::Files { paths } => Self::Files {
                paths: paths.iter().map(|path| path.to_string_lossy().into_owned()).collect(),
            },
            studio_core::ClipboardRead::Image { png } => Self::Image { png },
        }
    }
}
