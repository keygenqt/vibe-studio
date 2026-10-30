// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: A model as the provider host reports it, mirrored from vibe_cluster.

use vibe_cluster::ModelInfo;

/// A single model as a provider host reports it. Mirrors
/// `vibe_cluster::ModelInfo`; fields the provider does not report
/// stay `None`.
#[derive(Debug, Clone, Default, serde::Serialize)]
pub struct ModelInfoData {
    /// Model name as the provider addresses it (call/execute use it).
    pub name: String,
    /// Content digest (Ollama /api/tags).
    pub digest: Option<String>,
    /// Name of the upstream model, if the model is remote (Ollama cloud).
    pub remote_model: Option<String>,
    /// URL of the upstream host, if the model is remote (Ollama cloud).
    pub remote_host: Option<String>,
    /// Owner the model belongs to (OpenAI-compatible /models `owned_by`).
    pub owned_by: Option<String>,
    /// Last modified timestamp, ISO 8601 (Ollama /api/tags `modified_at`).
    pub modified_at: Option<String>,
    /// Creation timestamp, unix seconds (OpenAI-compatible /models `created`).
    pub created: Option<i64>,
    /// Model file format, e.g. "gguf".
    pub format: Option<String>,
    /// Primary model family, e.g. "llama".
    pub family: Option<String>,
    /// All families, incl. projector families like "clip".
    pub families: Option<Vec<String>>,
    /// Approximate parameter count label, e.g. "8.0B".
    pub params: Option<String>,
    /// Quantization level, e.g. "Q4_K_M".
    pub quantization: Option<String>,
    /// Size on disk, bytes.
    pub size: Option<u64>,
    /// Context window in tokens (/api/show → model_info.<arch>.context_length).
    pub context_length: Option<u64>,
    /// Model accepts images as input.
    pub vision: Option<bool>,
    /// Model supports tool calling.
    pub tools: Option<bool>,
    /// Model produces reasoning (thinking) output.
    pub thinking: Option<bool>,
    /// Model produces embeddings, not chat completions.
    pub embedding: Option<bool>,
}

impl From<ModelInfo> for ModelInfoData {
    fn from(info: ModelInfo) -> Self {
        ModelInfoData {
            name: info.name,
            digest: info.digest,
            remote_model: info.remote_model,
            remote_host: info.remote_host,
            owned_by: info.owned_by,
            modified_at: info.modified_at,
            created: info.created,
            format: info.format,
            family: info.family,
            families: info.families,
            params: info.params,
            quantization: info.quantization,
            size: info.size,
            context_length: info.context_length,
            vision: info.vision,
            tools: info.tools,
            thinking: info.thinking,
            embedding: info.embedding,
        }
    }
}
