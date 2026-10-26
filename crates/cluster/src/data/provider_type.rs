// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

use vibe_cluster::Provider;

/// Provider kind supported by the studio; mirrors `vibe_cluster::Provider`.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub enum ProviderTypeData {
    #[default]
    Ollama,
    DeepSeek,
    Qwen,
    Moonshot,
    Zhipu,
}

impl ProviderTypeData {
    /// All supported providers, catalog order.
    pub const ALL: [ProviderTypeData; 5] = [
        ProviderTypeData::Ollama,
        ProviderTypeData::DeepSeek,
        ProviderTypeData::Qwen,
        ProviderTypeData::Moonshot,
        ProviderTypeData::Zhipu,
    ];
}

/// Adapts the kind for `ConnectionParams` — the only point where the
/// external enum is produced.
impl From<ProviderTypeData> for Provider {
    fn from(provider: ProviderTypeData) -> Self {
        match provider {
            ProviderTypeData::Ollama => Provider::Ollama,
            ProviderTypeData::DeepSeek => Provider::DeepSeek,
            ProviderTypeData::Qwen => Provider::Qwen,
            ProviderTypeData::Moonshot => Provider::Moonshot,
            ProviderTypeData::Zhipu => Provider::Zhipu,
        }
    }
}
