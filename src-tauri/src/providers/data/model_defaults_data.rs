// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The model parameter spec served to the shell, mirrored from studio-core.

use serde::Serialize;

/// One parameter: the born default and the save bounds.
#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelParamSpec {
    /// The insert-time default.
    pub default: f64,
    /// The save lower bound; `None` = unbounded.
    pub min: Option<f64>,
    /// The save upper bound; `None` = unbounded.
    pub max: Option<f64>,
}

/// The reasoning effort spec: the born value and the select steps.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EffortSpec {
    /// The born effort value.
    pub default: String,
    /// The steps the UI select offers.
    pub values: Vec<String>,
}

/// The parameter set of one model: the family base merged with the
/// override; a parameter the section does not list stays `None`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
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

impl From<studio_core::ModelDefaultsData> for ModelDefaultsData {
    fn from(data: studio_core::ModelDefaultsData) -> Self {
        let spec = |spec: Option<studio_core::ModelParamSpec>| {
            spec.map(|spec| ModelParamSpec {
                default: spec.default,
                min: spec.min,
                max: spec.max,
            })
        };
        Self {
            temperature: spec(data.temperature),
            seed: spec(data.seed),
            top_p: spec(data.top_p),
            top_k: spec(data.top_k),
            min_p: spec(data.min_p),
            stop: data.stop,
            num_ctx: spec(data.num_ctx),
            num_predict: spec(data.num_predict),
            reasoning_max_tokens: spec(data.reasoning_max_tokens),
            effort: data.effort.map(|spec| EffortSpec {
                default: spec.default,
                values: spec.values,
            }),
        }
    }
}
