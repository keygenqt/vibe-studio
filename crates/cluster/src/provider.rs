// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

use vibe_cluster::Provider;

/// Metadata of a provider type the cluster can serve.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProviderInfo {
    /// Kind id as stored in the provider state: "ollama", "deepseek", ...
    pub provider: &'static str,
    /// Display title.
    pub name: &'static str,
    /// Host prefilled by the add form; None = the user types it.
    pub default_host: Option<&'static str>,
    /// Brand color for UI avatars and accents.
    pub color: &'static str,
}

/// Catalog facts of a provider: kind id, display title, default host
/// and brand color. The single place mapping variants to studio facts.
fn catalog(provider: &Provider) -> (&'static str, &'static str, &'static str, &'static str) {
    match provider {
        Provider::Ollama => ("ollama", "Ollama", "http://localhost:11434", "#6b7280"),
        Provider::DeepSeek => ("deepseek", "DeepSeek", "https://api.deepseek.com/v1", "#4D6BFE"),
        Provider::Qwen => (
            "qwen",
            "Qwen",
            "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            "#8B5CF6",
        ),
        Provider::Moonshot => ("moonshot", "Moonshot", "https://api.moonshot.cn/v1", "#1f2937"),
        Provider::Zhipu => ("zhipu", "Zhipu", "https://open.bigmodel.cn/api/paas/v4", "#3859FF"),
    }
}

/// Catalog of supported provider types — the single source for the
/// add form and for validation in core. Built over vibe-cluster's
/// provider list: a new provider variant fails to compile here until
/// it gets its kind, name, host and color.
pub fn providers() -> Vec<ProviderInfo> {
    Provider::ALL
        .iter()
        .map(|provider| {
            let (kind, name, host, color) = catalog(provider);
            ProviderInfo {
                provider: kind,
                name,
                default_host: Some(host),
                color,
            }
        })
        .collect()
}

/// The vibe-cluster provider for a catalog kind id; None = unknown kind.
pub fn provider_by_kind(kind: &str) -> Option<Provider> {
    Provider::ALL
        .iter()
        .find(|provider| catalog(provider).0 == kind)
        .copied()
}
