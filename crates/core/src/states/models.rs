// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use anyhow::bail;

use studio_states::Model;
use studio_states::ModelConfig;
use studio_states::ModelFacts;
use studio_states::Provider;
use studio_states::Store;

/// All models selected for a provider, ordered by name; a store error
/// empty list — loading never blocks the UI.
pub(crate) fn models_load(store: &Store, provider_id: i32) -> Vec<Model> {
    store.models_list(provider_id).unwrap_or_default()
}

/// Loads one model by id.
pub(crate) fn model_load(store: &Store, id: i32) -> Result<Model> {
    store.model_load(id)
}

/// Validates, clamps and persists the user-owned config; the UI is
/// not trusted: empty is valid, whitespace-only is an error. Returns
/// the stored row.
pub(crate) fn model_save(store: &Store, id: i32, config: &ModelConfig) -> Result<Model> {
    let display_name = optional_text(
        config.display_name.as_deref().unwrap_or(""),
        "Display name must not be blank.",
    )?;
    let system_prompt = optional_text(&config.system_prompt, "System prompt must not be blank.")?.unwrap_or_default();

    store.model_save(
        id,
        &ModelConfig {
            display_name,
            system_prompt,
            temperature: config.temperature.clamp(0.0, 2.0),
            seed: config.seed.max(0),
            num_ctx: config.num_ctx.max(1),
            num_predict: config.num_predict.max(1),
        },
    )
}

/// Optional text: empty is valid (`None`), whitespace-only is an
/// error; the value is trimmed on the way through.
fn optional_text(raw: &str, message: &str) -> Result<Option<String>> {
    if !raw.is_empty() && raw.trim().is_empty() {
        bail!("{}", message);
    }
    let trimmed = raw.trim();
    Ok((!trimmed.is_empty()).then(|| trimmed.to_string()))
}

/// Persists the selection of one provider's model catalog: fetches
/// the live list from the host and upserts the selected models with
/// fresh facts. The provider row is
/// loaded by id here: the UI sends only the id and the selected
/// names. A fetch error aborts before any mutation — a failed sync
/// never touches the table. An empty selection is valid.
pub(crate) async fn models_sync(store: &Store, provider_id: i32, checked: Vec<String>) -> Result<Vec<Model>> {
    let provider = store.provider_load(provider_id)?;
    let facts = fetch_facts(&provider).await?;

    store.models_sync(provider_id, &facts, &checked)?;

    store.models_list(provider_id)
}

/// Maps the live catalog of the provider to sync facts; `thinking`
/// lands in `reasoning`, `web` nobody fills yet.
async fn fetch_facts(provider: &Provider) -> Result<Vec<ModelFacts>> {
    let models = studio_cluster::fetch_models(&provider.provider, &provider.host, provider.api_key.as_deref()).await?;

    Ok(models
        .into_iter()
        .map(|model| ModelFacts {
            name: model.name,
            params: model.params,
            vision: model.vision,
            tools: model.tools,
            reasoning: model.thinking,
            web: None,
        })
        .collect())
}
