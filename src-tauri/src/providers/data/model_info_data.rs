// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: A live host catalog model, mirrored from studio-cluster.

use serde::Serialize;

use studio_core::ModeCapabilityData;

/// A single model as a provider host reports it, mirrored from
/// studio-cluster; fields the provider does not report stay `None`.
/// The capabilities carry the core type as is — the same serde keys
/// the stored JSON document uses.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
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
    /// Context window in tokens.
    pub context_length: Option<u64>,
    /// The full capability matrix: modalities and abilities together.
    pub capabilities: ModeCapabilityData,
}

impl From<studio_core::ModelInfoData> for ModelInfoData {
    fn from(data: studio_core::ModelInfoData) -> Self {
        Self {
            name: data.name,
            digest: data.digest,
            remote_model: data.remote_model,
            remote_host: data.remote_host,
            owned_by: data.owned_by,
            modified_at: data.modified_at,
            created: data.created,
            format: data.format,
            family: data.family,
            families: data.families,
            params: data.params,
            quantization: data.quantization,
            size: data.size,
            context_length: data.context_length,
            capabilities: data.capabilities,
        }
    }
}
