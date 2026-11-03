// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The clipboard read answer: text, file paths or an image as base64 PNG.

/// The clipboard content by its kind: the priority text → files →
/// image is resolved on the Rust side, JS receives one variant.
#[derive(Debug, Clone, serde::Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ClipboardRead {
    /// Plain text.
    Text {
        /// The clipboard text.
        text: String,
    },
    /// File references: a file-manager copy or `file://` text that
    /// resolves to existing targets.
    Files {
        /// The referenced paths.
        paths: Vec<std::path::PathBuf>,
    },
    /// Pixel image as base64 PNG.
    Image {
        /// The image bytes, base64-encoded PNG.
        png: String,
    },
}
