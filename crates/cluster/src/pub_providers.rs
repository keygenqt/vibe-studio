// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The provider catalog: the static rows and the live host model sync.

//! The provider catalog: the static rows for the forms and the live
//! model sync of a provider host.

use anyhow::Result;
use vibe_cluster::Connection;
use vibe_cluster::GigaChatParams;
use vibe_cluster::OllamaParams;
use vibe_cluster::OpenAiParams;
use vibe_cluster::Params;

use crate::data::ModelInfoData;
use crate::data::ProviderInfoData;
use crate::data::ProviderTypeData;

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
    project: Option<&str>,
) -> Result<Vec<ModelInfoData>> {
    // the sync path carries no generation, but the params variant
    // must still match the provider family for the factory
    let params = match provider {
        ProviderTypeData::Ollama => Params::Ollama(OllamaParams::default()),
        ProviderTypeData::GigaChat => Params::GigaChat(GigaChatParams::default()),
        _ => Params::OpenAi(OpenAiParams::default()),
    };
    let client = vibe_cluster::create_client(Connection {
        provider: provider.into(),
        host: host.to_string(),
        params,
        api_key: api_key.map(String::from),
        project: project.map(String::from),
        ..Default::default()
    })?;

    let models = client.list_models().await?;
    // the sync log: what the host reports and how we read it —
    // the base for the capability rules
    let kind = ProviderInfoData::from(provider).provider;
    log::info!("model sync [{kind}] {host}: {} models", models.len());
    for model in &models {
        log::info!(
            "model sync [{kind}] {} — vision={:?} tools={:?} thinking={:?} embedding={:?} family={:?} owned_by={:?} context={:?}",
            model.name,
            model.capabilities.input.vision,
            model.capabilities.abilities.tools,
            model.capabilities.abilities.thinking,
            model.capabilities.abilities.embedding,
            model.family,
            model.owned_by,
            model.context_length,
        );
    }
    Ok(models
        .into_iter()
        .filter(|model| model.capabilities.abilities.embedding != Some(true))
        .map(ModelInfoData::from)
        .collect())
}
