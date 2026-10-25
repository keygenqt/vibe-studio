// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

//! Live provider model catalog over `vibe-cluster`: fetches the model
//! list of a single configured provider host.

use vibe_cluster::{ClusterError, ConnectionParams, ModelInfo};

use crate::provider::provider_by_kind;

/// Fetches the live model catalog from a provider host. Embedding
/// models are filtered out — they cannot serve prompts; an unknown
/// kind is a configuration error.
pub async fn fetch_models(kind: &str, host: &str, api_key: Option<&str>) -> Result<Vec<ModelInfo>, ClusterError> {
    let provider =
        provider_by_kind(kind).ok_or_else(|| ClusterError::Config(format!("Unknown provider kind: {}.", kind)))?;

    let client = vibe_cluster::create_client(ConnectionParams {
        provider,
        host: host.to_string(),
        api_key: api_key.map(String::from),
        ..Default::default()
    });

    let models = client.list_models().await?;
    Ok(models
        .into_iter()
        .filter(|model| model.embedding != Some(true))
        .collect())
}
