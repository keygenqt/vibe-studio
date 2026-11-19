// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The static provider catalog row, mirrored from studio-cluster.

use serde::Serialize;

/// A static provider catalog row served to the shell: kind id,
/// display title, default host and brand color.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderInfoData {
    /// Kind id as stored in the provider state: "ollama", ...
    pub provider: String,
    /// Display title.
    pub name: String,
    /// Host prefilled by the add form.
    pub default_host: String,
    /// Brand color for UI avatars and accents.
    pub color: String,
}

impl From<studio_core::ProviderInfoData> for ProviderInfoData {
    fn from(data: studio_core::ProviderInfoData) -> Self {
        Self {
            provider: data.provider.to_string(),
            name: data.name.to_string(),
            default_host: data.default_host.to_string(),
            color: data.color.to_string(),
        }
    }
}
