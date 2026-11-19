// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The provider model wire type, mirrored from studio-core.

use serde::{Deserialize, Serialize};

/// A model of a provider catalog served to the shell: the mirror of
/// the core row. The capabilities ride the stored JSON document.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderModelData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the provider this model belongs to.
    pub provider_id: i32,
    /// Model name as the provider addresses it — the call key.
    pub name: String,
    /// Sync-owned: approximate parameter count label.
    pub params: Option<String>,
    /// Sync-owned: context window in tokens the host reports.
    pub context_length: Option<i64>,
    /// Sync-owned capability matrix as a JSON document.
    pub capabilities: Option<serde_json::Value>,
    /// User-owned display title; empty = derived from `name`.
    pub display_name: String,
    /// User-owned system prompt; empty = not set.
    pub system_prompt: String,
    /// Sampling temperature.
    pub temperature: f64,
    /// Sampling seed.
    pub seed: i64,
    /// Top-p nucleus sampling cutoff.
    pub top_p: f64,
    /// Top-k sampling cutoff.
    pub top_k: i32,
    /// Min-p sampling cutoff.
    pub min_p: f64,
    /// Stop sequences; empty = none.
    pub stop: Vec<String>,
    /// Context window, tokens.
    pub num_ctx: i32,
    /// Max tokens per generation.
    pub num_predict: i32,
    /// Reasoning depth: "low" | "high"; `None` = provider default.
    pub effort: Option<String>,
    /// Cap on reasoning tokens (GigaChat); `None` = not sent.
    pub reasoning_max_tokens: Option<i32>,
    /// Think toggle (Ollama); `None` = server default.
    pub think: Option<bool>,
}

impl From<studio_core::ProviderModelData> for ProviderModelData {
    fn from(data: studio_core::ProviderModelData) -> Self {
        Self {
            id: data.id,
            provider_id: data.provider_id,
            name: data.name,
            params: data.params,
            context_length: data.context_length,
            capabilities: data.capabilities,
            display_name: data.display_name,
            system_prompt: data.system_prompt,
            temperature: data.temperature,
            seed: data.seed,
            top_p: data.top_p,
            top_k: data.top_k,
            min_p: data.min_p,
            stop: data.stop,
            num_ctx: data.num_ctx,
            num_predict: data.num_predict,
            effort: data.effort,
            reasoning_max_tokens: data.reasoning_max_tokens,
            think: data.think,
        }
    }
}

impl From<&ProviderModelData> for studio_core::ProviderModelData {
    fn from(data: &ProviderModelData) -> Self {
        Self {
            id: data.id,
            provider_id: data.provider_id,
            name: data.name.clone(),
            params: data.params.clone(),
            context_length: data.context_length,
            capabilities: data.capabilities.clone(),
            display_name: data.display_name.clone(),
            system_prompt: data.system_prompt.clone(),
            temperature: data.temperature,
            seed: data.seed,
            top_p: data.top_p,
            top_k: data.top_k,
            min_p: data.min_p,
            stop: data.stop.clone(),
            num_ctx: data.num_ctx,
            num_predict: data.num_predict,
            effort: data.effort.clone(),
            reasoning_max_tokens: data.reasoning_max_tokens,
            think: data.think,
        }
    }
}
