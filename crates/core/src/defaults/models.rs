// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The model parameter catalog: defaults and bounds by family and exact model name.

//! The model parameter catalog: the default a fresh row is born with
//! and the bounds the save validation enforces.
//!
//! `models.json` is the single source: each family section lists the
//! parameters its schema carries, the model entries override by the
//! exact name; a parameter the section does not list stays `None`.

use std::sync::OnceLock;

use studio_cluster::CallParamsData;
use studio_cluster::ProviderTypeData;

/// One parameter: the insert-time default and the save bounds.
#[derive(Debug, Clone, Copy, serde::Deserialize, serde::Serialize)]
pub struct ModelParamSpec {
    pub default: f64,
    pub min: Option<f64>,
    pub max: Option<f64>,
}

/// The reasoning effort spec: the born value and the steps the UI
/// select offers; the save validation checks the value against them.
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EffortSpec {
    pub default: String,
    pub values: Vec<String>,
}

/// The parameter set of one model: the family base merged with the
/// override; a parameter the section does not list stays `None`.
/// The effort spec holds a `Vec` — the set is `Clone`, not `Copy`.
#[derive(Debug, Clone, serde::Serialize)]
pub struct ModelDefaultsData {
    pub temperature: Option<ModelParamSpec>,
    pub seed: Option<ModelParamSpec>,
    pub top_p: Option<ModelParamSpec>,
    pub top_k: Option<ModelParamSpec>,
    pub min_p: Option<ModelParamSpec>,
    /// The family carries stop sequences; `None` = the schema has none.
    pub stop: Option<bool>,
    pub num_ctx: Option<ModelParamSpec>,
    pub num_predict: Option<ModelParamSpec>,
    /// Cap on reasoning tokens (GigaChat); `None` = the schema has none.
    pub reasoning_max_tokens: Option<ModelParamSpec>,
    /// The reasoning effort spec; `None` = the schema has none.
    pub effort: Option<EffortSpec>,
}

/// The embedded catalog: one section per provider family.
#[derive(serde::Deserialize)]
struct Catalog {
    ollama: Family,
    openai: Family,
    gigachat: Family,
}

/// One family section: the base parameters and the per-name overrides.
#[derive(serde::Deserialize)]
struct Family {
    base: Base,
    #[serde(default)]
    models: Vec<Entry>,
}

/// The parameter set of a family base: the section lists what its
/// schema carries, the rest stays out.
#[derive(serde::Deserialize)]
struct Base {
    temperature: Option<ModelParamSpec>,
    seed: Option<ModelParamSpec>,
    top_p: Option<ModelParamSpec>,
    top_k: Option<ModelParamSpec>,
    min_p: Option<ModelParamSpec>,
    stop: Option<bool>,
    num_ctx: Option<ModelParamSpec>,
    num_predict: Option<ModelParamSpec>,
    reasoning_max_tokens: Option<ModelParamSpec>,
    effort: Option<EffortSpec>,
}

/// Overrides of one model: only the deviating parameters.
#[derive(Default, serde::Deserialize)]
struct Overrides {
    temperature: Option<ModelParamSpec>,
    seed: Option<ModelParamSpec>,
    top_p: Option<ModelParamSpec>,
    top_k: Option<ModelParamSpec>,
    min_p: Option<ModelParamSpec>,
    stop: Option<bool>,
    num_ctx: Option<ModelParamSpec>,
    num_predict: Option<ModelParamSpec>,
    reasoning_max_tokens: Option<ModelParamSpec>,
    effort: Option<EffortSpec>,
}

#[derive(serde::Deserialize)]
struct Entry {
    name: String,
    #[serde(flatten)]
    overrides: Overrides,
}

/// The parsed catalog, kept for the app lifetime.
fn catalog() -> &'static Catalog {
    static CATALOG: OnceLock<Catalog> = OnceLock::new();
    CATALOG.get_or_init(|| serde_json::from_str(include_str!("models.json")).expect("models.json is embedded data"))
}

/// The merged parameter set of the model: the exact name match wins,
/// everything else inherits the family base.
pub(crate) fn resolve(provider: ProviderTypeData, name: &str) -> ModelDefaultsData {
    let catalog = catalog();
    let family = match provider {
        ProviderTypeData::Ollama => &catalog.ollama,
        ProviderTypeData::GigaChat => &catalog.gigachat,
        _ => &catalog.openai,
    };
    let overrides = family
        .models
        .iter()
        .find(|entry| entry.name == name)
        .map(|entry| &entry.overrides);
    let pick =
        |override_value: Option<ModelParamSpec>, base_value: Option<ModelParamSpec>| override_value.or(base_value);
    ModelDefaultsData {
        temperature: pick(overrides.and_then(|o| o.temperature), family.base.temperature),
        seed: pick(overrides.and_then(|o| o.seed), family.base.seed),
        top_p: pick(overrides.and_then(|o| o.top_p), family.base.top_p),
        top_k: pick(overrides.and_then(|o| o.top_k), family.base.top_k),
        min_p: pick(overrides.and_then(|o| o.min_p), family.base.min_p),
        stop: overrides.and_then(|o| o.stop).or(family.base.stop),
        num_ctx: pick(overrides.and_then(|o| o.num_ctx), family.base.num_ctx),
        num_predict: pick(overrides.and_then(|o| o.num_predict), family.base.num_predict),
        reasoning_max_tokens: pick(
            overrides.and_then(|o| o.reasoning_max_tokens),
            family.base.reasoning_max_tokens,
        ),
        effort: overrides
            .and_then(|o| o.effort.clone())
            .or_else(|| family.base.effort.clone()),
    }
}

/// The catalog defaults of one model as the call params: the listed
/// parameters carry their defaults, the rest — "not sent".
impl From<ModelDefaultsData> for CallParamsData {
    fn from(spec: ModelDefaultsData) -> Self {
        CallParamsData {
            temperature: spec.temperature.map(|spec| spec.default),
            seed: spec.seed.map(|spec| spec.default as i64),
            top_p: spec.top_p.map(|spec| spec.default),
            top_k: spec.top_k.map(|spec| spec.default as i32),
            min_p: spec.min_p.map(|spec| spec.default),
            stop: None,
            num_ctx: spec.num_ctx.map(|spec| spec.default as i32),
            num_predict: spec.num_predict.map(|spec| spec.default as i32),
            reasoning_max_tokens: spec.reasoning_max_tokens.map(|spec| spec.default as i32),
            // task calls keep the provider's own reasoning default —
            // the user-owned knob rides the chat calls only
            effort: None,
            think: None,
        }
    }
}
