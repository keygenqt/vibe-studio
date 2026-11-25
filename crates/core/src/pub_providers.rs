// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The providers block: connections, model catalogs and their defaults.

//! The providers block functions: the catalog, the provider CRUD,
//! the model rows with their defaults and the live sync.

use anyhow::Result;

use studio_cluster::ModelInfoData;
use studio_cluster::ProviderInfoData;
use studio_cluster::ProviderTypeData;
use studio_states::ProviderData;
use studio_states::ProviderModelData;
use studio_states::Store;

use crate::defaults::models;
use crate::defaults::models::ModelDefaultsData;

/// Catalog of supported provider types — the single source for the
/// add form and for validation.
pub fn get_providers_catalog() -> Vec<ProviderInfoData> {
    studio_cluster::get_providers()
}

/// All configured providers; a store error yields an empty list —
/// loading never blocks the UI.
pub fn get_providers(store: &Store) -> Vec<ProviderData> {
    studio_states::get_providers(store).unwrap_or_default()
}

/// Loads one provider by id.
pub fn get_provider(store: &Store, id: i32) -> Result<ProviderData> {
    studio_states::get_provider(store, id)
}

/// Validates against the cluster catalog, then inserts or updates.
/// The UI is not trusted: the kind must match the catalog exactly,
/// blank name and host are errors; everything else is stored as sent.
pub fn save_provider(store: &Store, provider: &ProviderData) -> Result<ProviderData> {
    if studio_cluster::get_provider_by_kind(&provider.provider).is_none() {
        anyhow::bail!("Unknown provider.");
    }
    if provider.name.trim().is_empty() {
        anyhow::bail!("Name must not be blank.");
    }
    if provider.host.trim().is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    studio_states::save_provider(store, provider)
}

/// Deletes the provider; a missing row is a no-op.
pub fn delete_provider(store: &Store, id: i32) -> Result<()> {
    studio_states::delete_provider(store, id)?;
    Ok(())
}

/// All models, optionally of one provider; a store error yields an
/// empty list — loading never blocks the UI.
pub fn get_provider_models(store: &Store, provider_id: Option<i32>) -> Vec<ProviderModelData> {
    studio_states::get_provider_models(store, provider_id).unwrap_or_default()
}

/// Loads one model by id.
pub fn get_provider_model(store: &Store, id: i32) -> Result<ProviderModelData> {
    studio_states::get_provider_model(store, id)
}

/// The parameter spec of the model: the defaults a fresh row is born
/// with and the bounds the form and the save validation enforce. The
/// kind is not trusted: must be in the catalog; the exact name match
/// wins, everything else is the base of the family.
pub fn get_model_defaults(kind: &str, name: &str) -> Result<ModelDefaultsData> {
    let provider =
        studio_cluster::get_provider_by_kind(kind).ok_or_else(|| anyhow::anyhow!("Unknown provider kind: {kind}."))?;
    Ok(models::resolve(provider, name))
}

/// Fetches the live model catalog of a provider host. The kind is not
/// trusted: must be in the catalog; the host is trimmed, blank is an
/// error. Embedding models are filtered out on the cluster layer.
pub async fn get_provider_models_by_type(
    kind: &str,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
) -> Result<Vec<ModelInfoData>> {
    let host = host.trim();
    if host.is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    let provider =
        studio_cluster::get_provider_by_kind(kind).ok_or_else(|| anyhow::anyhow!("Unknown provider kind: {kind}."))?;
    Ok(studio_cluster::get_provider_models_by_type(provider, host, api_key, project).await?)
}

/// Validates and persists the model. The UI is not trusted: the id
/// must exist, whitespace-only texts are errors, the config values
/// must fit the bounds of the model's catalog entry; everything else
/// is stored as sent.
pub fn save_provider_model(store: &Store, model: &ProviderModelData) -> Result<ProviderModelData> {
    let Some(id) = model.id else {
        anyhow::bail!("Model id is required.");
    };
    let stored = studio_states::get_provider_model(store, id)?;
    if !model.display_name.is_empty() && model.display_name.trim().is_empty() {
        anyhow::bail!("Display name must not be blank.");
    }
    if !model.system_prompt.is_empty() && model.system_prompt.trim().is_empty() {
        anyhow::bail!("System prompt must not be blank.");
    }
    let provider = studio_states::get_provider(store, stored.provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let spec = models::resolve(kind, &model.name);
    let in_range = |value: f64, spec: models::ModelParamSpec| {
        spec.min.is_none_or(|min| value >= min) && spec.max.is_none_or(|max| value <= max)
    };
    if let Some(spec) = spec.temperature {
        if !in_range(model.temperature, spec) {
            anyhow::bail!("Temperature is out of range.");
        }
    }
    if let Some(spec) = spec.seed {
        if !in_range(model.seed as f64, spec) {
            anyhow::bail!("Seed is out of range.");
        }
    }
    if let Some(spec) = spec.top_p {
        if !in_range(model.top_p, spec) {
            anyhow::bail!("Top p is out of range.");
        }
    }
    if let Some(spec) = spec.top_k {
        if !in_range(model.top_k as f64, spec) {
            anyhow::bail!("Top k is out of range.");
        }
    }
    if let Some(spec) = spec.min_p {
        if !in_range(model.min_p, spec) {
            anyhow::bail!("Min p is out of range.");
        }
    }
    if let Some(spec) = spec.num_ctx {
        if !in_range(model.num_ctx as f64, spec) {
            anyhow::bail!("Num ctx is out of range.");
        }
        if let Some(limit) = stored.context_length {
            if model.num_ctx > limit as i32 {
                anyhow::bail!("Num ctx must not exceed the model context window.");
            }
        }
    }
    if let Some(spec) = spec.num_predict {
        if !in_range(model.num_predict as f64, spec) {
            anyhow::bail!("Num predict is out of range.");
        }
    }
    // the effort value must be one of the model's catalog steps; a
    // model without a catalog entry keeps the universal low/high
    if let Some(value) = &model.effort {
        let known = match &spec.effort {
            Some(spec) => spec.values.iter().any(|item| item == value),
            None => matches!(value.as_str(), "low" | "high"),
        };
        if !known {
            anyhow::bail!("Unknown effort value.");
        }
    }
    if let Some(spec) = spec.reasoning_max_tokens {
        if let Some(value) = model.reasoning_max_tokens {
            if !in_range(value as f64, spec) {
                anyhow::bail!("Reasoning max tokens is out of range.");
            }
        }
    }
    studio_states::save_provider_model(store, model)
}

/// Persists the selection of one provider's model catalog: fetches
/// the live list from the host and upserts the selected models with
/// fresh facts; models outside the selection are removed. The UI
/// sends only the provider id and the selected names. A model new to
/// the table is born with the defaults of its catalog entry; a known
/// one keeps its stored config — the sync refreshes the facts only.
/// A fetch error aborts before any mutation — a failed sync never
/// touches the table. An empty selection is valid.
pub async fn save_provider_models(
    store: &Store,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<ProviderModelData>> {
    let provider = studio_states::get_provider(store, provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let models = get_provider_models_by_type(
        &provider.provider,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
    )
    .await?;
    let stored = studio_states::get_provider_models(store, Some(provider_id))?;
    let rows: Vec<ProviderModelData> = models
        .into_iter()
        .filter(|model| checked.iter().any(|name| *name == model.name))
        .map(|model| match stored.iter().find(|row| row.name == model.name) {
            // the stored row keeps its config, the sync refreshes the facts
            Some(row) => ProviderModelData {
                params: model.params,
                context_length: model.context_length.map(|value| value as i64),
                capabilities: serde_json::to_value(model.capabilities).ok(),
                ..row.clone()
            },
            // a fresh row is born with its catalog defaults
            None => {
                let spec = models::resolve(kind, &model.name);
                // the reasoning knobs are born where they are settable:
                // think on for a reasoning-capable Ollama model, effort
                // with the catalog default for a reasoning cloud model
                let settable = matches!(model.capabilities.effort, Some(true));
                let think = if matches!(kind, ProviderTypeData::Ollama) && settable {
                    Some(true)
                } else {
                    None
                };
                let effort = if !matches!(kind, ProviderTypeData::Ollama) && settable {
                    spec.effort.as_ref().map(|spec| spec.default.clone())
                } else {
                    None
                };
                ProviderModelData {
                    id: None,
                    provider_id,
                    name: model.name,
                    params: model.params,
                    context_length: model.context_length.map(|value| value as i64),
                    capabilities: serde_json::to_value(model.capabilities).ok(),
                    display_name: String::new(),
                    system_prompt: String::new(),
                    temperature: spec.temperature.map(|spec| spec.default).unwrap_or(0.0),
                    seed: spec.seed.map(|spec| spec.default).unwrap_or(0.0) as i64,
                    top_p: spec.top_p.map(|spec| spec.default).unwrap_or(0.0),
                    top_k: spec.top_k.map(|spec| spec.default as i32).unwrap_or(0),
                    min_p: spec.min_p.map(|spec| spec.default).unwrap_or(0.0),
                    stop: Vec::new(),
                    num_ctx: spec.num_ctx.map(|spec| spec.default as i32).unwrap_or(0),
                    num_predict: spec.num_predict.map(|spec| spec.default as i32).unwrap_or(0),
                    effort,
                    // reasoning_max_tokens rides its family spec; a
                    // family without the parameter stays empty
                    reasoning_max_tokens: spec.reasoning_max_tokens.map(|spec| spec.default as i32),
                    think,
                }
            }
        })
        .collect();
    studio_states::save_provider_models(store, provider_id, &rows)
}
