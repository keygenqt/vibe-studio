// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Static provider catalog rows: kind id, title, default host, brand color.

use super::ProviderTypeData;

/// Static catalog row of a provider: kind id, display title, default
/// host and brand color. Built in the provider catalog.
#[derive(Debug, Clone, serde::Serialize)]
pub struct ProviderInfoData {
    /// Kind id as stored in the provider state: "ollama", "deepseek", ...
    pub provider: &'static str,
    /// Display title.
    pub name: &'static str,
    /// Host prefilled by the add form.
    pub default_host: &'static str,
    /// Brand color for UI avatars and accents.
    pub color: &'static str,
}

/// Catalog row of a provider kind — built on the data constructors.
impl From<ProviderTypeData> for ProviderInfoData {
    fn from(provider: ProviderTypeData) -> Self {
        match provider {
            ProviderTypeData::Ollama => Self::new_ollama(),
            ProviderTypeData::DeepSeek => Self::new_deepseek(),
            ProviderTypeData::Qwen => Self::new_qwen(),
            ProviderTypeData::Moonshot => Self::new_moonshot(),
            ProviderTypeData::Zhipu => Self::new_zhipu(),
        }
    }
}

impl ProviderInfoData {
    /// Ollama catalog row.
    pub fn new_ollama() -> Self {
        Self {
            provider: "ollama",
            name: "Ollama",
            default_host: "http://localhost:11434",
            color: "#6b7280",
        }
    }

    /// DeepSeek catalog row.
    pub fn new_deepseek() -> Self {
        Self {
            provider: "deepseek",
            name: "DeepSeek",
            default_host: "https://api.deepseek.com/v1",
            color: "#4D6BFE",
        }
    }

    /// Qwen catalog row.
    pub fn new_qwen() -> Self {
        Self {
            provider: "qwen",
            name: "Qwen",
            default_host: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            color: "#8B5CF6",
        }
    }

    /// Moonshot catalog row.
    pub fn new_moonshot() -> Self {
        Self {
            provider: "moonshot",
            name: "Moonshot",
            default_host: "https://api.moonshot.cn/v1",
            color: "#1f2937",
        }
    }

    /// Zhipu catalog row.
    pub fn new_zhipu() -> Self {
        Self {
            provider: "zhipu",
            name: "Zhipu",
            default_host: "https://open.bigmodel.cn/api/paas/v4",
            color: "#3859FF",
        }
    }
}
