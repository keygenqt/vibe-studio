// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The app version, debug flag and OS served to the shell.

use serde::Serialize;

/// App version, debug flag and OS.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfoData {
    pub version: String,
    pub is_debug: bool,
    /// The OS kind: `macos`, `linux`, `windows`.
    pub os: String,
}
