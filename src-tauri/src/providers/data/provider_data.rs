// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The provider connection wire type, mirrored from studio-core.

use serde::{Deserialize, Serialize};

/// A configured provider connection served to the shell: the mirror
/// of the core row without its diesel concerns.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// User-owned display name of the connection.
    pub name: String,
    /// Provider kind as a plain string: "ollama", "deepseek", ...
    pub provider: String,
    /// API endpoint URL of the connection.
    pub host: String,
    /// API key for cloud providers; `None` = not needed.
    pub api_key: Option<String>,
    /// Project/folder id for providers that route by it.
    pub project: Option<String>,
}

impl From<studio_core::ProviderData> for ProviderData {
    fn from(data: studio_core::ProviderData) -> Self {
        Self {
            id: data.id,
            name: data.name,
            provider: data.provider,
            host: data.host,
            api_key: data.api_key,
            project: data.project,
        }
    }
}

impl From<&ProviderData> for studio_core::ProviderData {
    fn from(data: &ProviderData) -> Self {
        Self {
            id: data.id,
            name: data.name.clone(),
            provider: data.provider.clone(),
            host: data.host.clone(),
            api_key: data.api_key.clone(),
            project: data.project.clone(),
        }
    }
}
