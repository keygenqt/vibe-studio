// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The theme choice wire type, mirrored from studio-core.

use serde::Serialize;

/// The theme choice served to the shell: the mirror of the core enum.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ThemeChoice {
    Light,
    Dark,
    System,
}

impl From<studio_core::ThemeChoice> for ThemeChoice {
    fn from(choice: studio_core::ThemeChoice) -> Self {
        match choice {
            studio_core::ThemeChoice::Light => Self::Light,
            studio_core::ThemeChoice::Dark => Self::Dark,
            studio_core::ThemeChoice::System => Self::System,
        }
    }
}
