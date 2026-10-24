// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

/// Metadata of a provider type the cluster can serve.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProviderInfo {
    /// Kind id as stored in the provider state: "ollama", "deepseek", ...
    pub provider: &'static str,
    /// Display title.
    pub name: &'static str,
    /// Host prefilled by the add form; None = the user types it.
    pub default_host: Option<&'static str>,
    /// Cloud providers require an api key, local ones do not.
    pub cloud: bool,
    /// Brand color for UI avatars and accents.
    pub color: &'static str,
}

/// Catalog of supported provider types — the single source for the
/// add form and for validation in core.
pub fn providers() -> Vec<ProviderInfo> {
    vec![
        ProviderInfo {
            provider: "ollama",
            name: "Ollama",
            default_host: Some("http://localhost:11434"),
            cloud: false,
            color: "#6b7280",
        },
        ProviderInfo {
            provider: "deepseek",
            name: "DeepSeek",
            default_host: Some("https://api.deepseek.com/v1"),
            cloud: true,
            color: "#4D6BFE",
        },
        ProviderInfo {
            provider: "qwen",
            name: "Qwen",
            default_host: Some("https://dashscope-intl.aliyuncs.com/compatible-mode/v1"),
            cloud: true,
            color: "#8B5CF6",
        },
        ProviderInfo {
            provider: "moonshot",
            name: "Kimi",
            default_host: Some("https://api.moonshot.cn/v1"),
            cloud: true,
            color: "#1f2937",
        },
        ProviderInfo {
            provider: "zhipu",
            name: "GLM",
            default_host: Some("https://open.bigmodel.cn/api/paas/v4"),
            cloud: true,
            color: "#3859FF",
        },
    ]
}
