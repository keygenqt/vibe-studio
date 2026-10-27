// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

//! Vibe Studio cluster — provider catalog and LLM requests.

mod data;

use anyhow::Result;
use vibe_cluster::ConnectionParams;

pub use data::ModelInfoData;
pub use data::ProviderInfoData;
pub use data::ProviderTypeData;

/// Catalog of supported provider kinds — the source for the add form.
pub fn get_providers() -> Vec<ProviderInfoData> {
    ProviderTypeData::ALL
        .iter()
        .copied()
        .map(ProviderInfoData::from)
        .collect()
}

/// The provider type for a kind id from the state; None = unknown kind.
pub fn get_provider_by_kind(kind: &str) -> Option<ProviderTypeData> {
    ProviderTypeData::ALL
        .iter()
        .copied()
        .find(|provider| ProviderInfoData::from(*provider).provider == kind)
}

/// Fetches the live model catalog from a provider host. Embedding models are filtered out — they cannot serve prompts.
pub async fn get_provider_models_by_type(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
) -> Result<Vec<ModelInfoData>> {
    let client = vibe_cluster::create_client(ConnectionParams {
        provider: provider.into(),
        host: host.to_string(),
        api_key: api_key.map(String::from),
        ..Default::default()
    });

    let models = client.list_models().await?;
    Ok(models
        .into_iter()
        .filter(|model| model.embedding != Some(true))
        .map(ModelInfoData::from)
        .collect())
}
