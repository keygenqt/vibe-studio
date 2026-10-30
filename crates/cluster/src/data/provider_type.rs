// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The provider kind enum of the studio, adapted to vibe_cluster::Provider.

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
    Yandex,
    GigaChat,
}

impl ProviderTypeData {
    /// All supported providers, catalog order.
    pub const ALL: [ProviderTypeData; 7] = [
        ProviderTypeData::Ollama,
        ProviderTypeData::DeepSeek,
        ProviderTypeData::Qwen,
        ProviderTypeData::Moonshot,
        ProviderTypeData::Zhipu,
        ProviderTypeData::Yandex,
        ProviderTypeData::GigaChat,
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
            ProviderTypeData::Yandex => Provider::Yandex,
            ProviderTypeData::GigaChat => Provider::GigaChat,
        }
    }
}
