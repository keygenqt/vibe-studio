// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

use serde::Serialize;

/// App version and debug flag.
#[derive(Serialize)]
pub struct AppInfoData {
    pub version: String,
    pub is_debug: bool,
}
