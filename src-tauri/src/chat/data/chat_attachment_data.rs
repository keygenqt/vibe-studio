// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The attachment metadata wire type, mirrored from studio-core.

use serde::Serialize;

/// The attachment metadata served to the shell: the stored bytes
/// never leave the store.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatAttachmentData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the message the attachment belongs to.
    pub message_id: i32,
    /// The original file name.
    pub name: String,
    /// The full path of the source file; `None` = clipboard image.
    pub path: Option<String>,
    /// The MIME type resolved by the content sniff.
    pub mime: String,
    /// Size of the stored content, bytes.
    pub size: i32,
}

impl From<studio_core::ChatAttachmentData> for ChatAttachmentData {
    fn from(data: studio_core::ChatAttachmentData) -> Self {
        Self {
            id: data.id,
            message_id: data.message_id,
            name: data.name,
            path: data.path,
            mime: data.mime,
            size: data.size,
        }
    }
}
