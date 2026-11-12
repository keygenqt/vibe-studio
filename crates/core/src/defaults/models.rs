// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The model parameter catalog: defaults and bounds resolved by the exact model name.

//! The model parameter catalog: the default a fresh row is born with
//! and the bounds the save validation enforces.
//!
//! `models.json` is the single source: `base` covers every model, the
//! `models` entries override parameters by the exact model name.

use std::sync::OnceLock;

/// One parameter: the insert-time default and the save bounds.
#[derive(Debug, Clone, Copy, serde::Deserialize, serde::Serialize)]
pub struct ModelParamSpec {
    pub default: f64,
    pub min: Option<f64>,
    pub max: Option<f64>,
}

/// The full parameter set of one model, the base merged with the override.
#[derive(Debug, Clone, Copy, serde::Serialize)]
pub struct ModelDefaultsData {
    pub temperature: ModelParamSpec,
    pub seed: ModelParamSpec,
    pub top_p: ModelParamSpec,
    pub top_k: ModelParamSpec,
    pub min_p: ModelParamSpec,
    pub num_ctx: ModelParamSpec,
    pub num_predict: ModelParamSpec,
}

/// The embedded catalog: the required base and the per-name overrides.
#[derive(serde::Deserialize)]
struct Catalog {
    base: Base,
    #[serde(default)]
    models: Vec<Entry>,
}

/// The base parameter set — the catalog guarantees every parameter.
#[derive(serde::Deserialize)]
struct Base {
    temperature: ModelParamSpec,
    seed: ModelParamSpec,
    top_p: ModelParamSpec,
    top_k: ModelParamSpec,
    min_p: ModelParamSpec,
    num_ctx: ModelParamSpec,
    num_predict: ModelParamSpec,
}

/// Overrides of one model: only the deviating parameters.
#[derive(Default, serde::Deserialize)]
struct Overrides {
    temperature: Option<ModelParamSpec>,
    seed: Option<ModelParamSpec>,
    top_p: Option<ModelParamSpec>,
    top_k: Option<ModelParamSpec>,
    min_p: Option<ModelParamSpec>,
    num_ctx: Option<ModelParamSpec>,
    num_predict: Option<ModelParamSpec>,
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
/// everything else inherits the base.
pub(crate) fn resolve(name: &str) -> ModelDefaultsData {
    let catalog = catalog();
    let overrides = catalog
        .models
        .iter()
        .find(|entry| entry.name == name)
        .map(|entry| &entry.overrides);
    let base = &catalog.base;
    let pick =
        |override_value: Option<ModelParamSpec>, base_value: ModelParamSpec| override_value.unwrap_or(base_value);
    ModelDefaultsData {
        temperature: pick(overrides.and_then(|o| o.temperature), base.temperature),
        seed: pick(overrides.and_then(|o| o.seed), base.seed),
        top_p: pick(overrides.and_then(|o| o.top_p), base.top_p),
        top_k: pick(overrides.and_then(|o| o.top_k), base.top_k),
        min_p: pick(overrides.and_then(|o| o.min_p), base.min_p),
        num_ctx: pick(overrides.and_then(|o| o.num_ctx), base.num_ctx),
        num_predict: pick(overrides.and_then(|o| o.num_predict), base.num_predict),
    }
}
