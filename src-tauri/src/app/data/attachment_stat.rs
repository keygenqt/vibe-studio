// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The draft facts of a dropped path, mirrored from studio-core.

use serde::Serialize;

/// The draft facts of a dropped path served to the shell: the
/// directory flag, the image MIME, the byte size.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AttachmentStatData {
    /// `true` = a directory, expands into its files at the send.
    pub dir: bool,
    /// The image MIME by the header sniff; `None` = not an image.
    pub mime: Option<String>,
    /// The size on disk, bytes.
    pub size: i64,
}

impl From<studio_core::AttachmentStatData> for AttachmentStatData {
    fn from(data: studio_core::AttachmentStatData) -> Self {
        Self {
            dir: data.dir,
            mime: data.mime,
            size: data.size,
        }
    }
}
