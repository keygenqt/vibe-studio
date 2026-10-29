// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

//! Vibe Studio cluster — provider catalog and LLM requests.

mod data;

use anyhow::Result;
use vibe_cluster::Cluster;
use vibe_cluster::ConnectionParams;
use vibe_cluster::HistoryMessage;
use vibe_cluster::Prompt;

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

/// Runs one prompt on one host+model with the given generation config
/// and the conversation history; returns the response text. The
/// history is (role, content) pairs — "user" | "assistant", oldest
/// first. Errors keep the cluster's message.
pub async fn call_prompt(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    model: &str,
    temperature: f64,
    seed: i64,
    num_ctx: i32,
    num_predict: i32,
    system: Option<String>,
    history: Vec<(String, String)>,
    user: &str,
) -> Result<String> {
    // config bounds are validated in core; the casts keep u64 happy
    let cluster = Cluster::new(vec![ConnectionParams {
        provider: provider.into(),
        host: host.to_string(),
        model: model.to_string(),
        temperature: Some(temperature),
        seed: Some(seed.max(0) as u64),
        num_ctx: Some(num_ctx.max(0) as usize),
        num_predict: Some(num_predict.max(0) as usize),
        api_key: api_key.map(String::from),
        ..Default::default()
    }])?;

    let mut prompt = Prompt::new(user, system, None);
    prompt.history = history
        .into_iter()
        .map(|(role, content)| HistoryMessage { role, content })
        .collect();

    let result = cluster.call(prompt).await?;
    Ok(result.text.unwrap_or_default())
}
