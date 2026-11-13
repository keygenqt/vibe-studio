// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The provider-agnostic call config and its family wire mapping.

//! The provider-agnostic generation config of one call. The values
//! come from the caller — the stored model config or the defaults
//! of the shell crate. The family mapping drops the parameters the
//! provider schema does not carry.

use vibe_cluster::Effort;
use vibe_cluster::GigaChatParams;
use vibe_cluster::OllamaParams;
use vibe_cluster::OpenAiParams;
use vibe_cluster::Params;

use crate::ProviderTypeData;

/// The generation config of one call. `None` = not sent, the
/// provider default applies.
#[derive(Debug, Clone, Default)]
pub struct CallParamsData {
    /// Sampling temperature.
    pub temperature: Option<f64>,
    /// Sampling seed.
    pub seed: Option<i64>,
    /// Top-p nucleus sampling cutoff.
    pub top_p: Option<f64>,
    /// Top-k sampling cutoff.
    pub top_k: Option<i32>,
    /// Min-p sampling cutoff.
    pub min_p: Option<f64>,
    /// Stop sequences; generation ends when one is produced.
    pub stop: Option<Vec<String>>,
    /// Context window size, tokens.
    pub num_ctx: Option<i32>,
    /// Maximum tokens per generation.
    pub num_predict: Option<i32>,
    /// Reasoning depth as the wire value; parsed at the family
    /// mapping, an unknown value drops out.
    pub effort: Option<String>,
    /// Cap on reasoning tokens (GigaChat).
    pub reasoning_max_tokens: Option<i32>,
    /// Think toggle (Ollama).
    pub think: Option<bool>,
}

impl CallParamsData {
    /// The wire params of the provider family: parameters the schema
    /// does not carry are dropped, `None` rides as "not sent".
    pub(crate) fn to_params(&self, provider: ProviderTypeData) -> Params {
        // an empty stop list reads as "no sequences"
        let stop = self.stop.as_ref().filter(|stop| !stop.is_empty()).cloned();
        let seed = self.seed.map(|value| value.max(0) as u64);
        let top_k = self.top_k.map(|value| value.max(0) as u32);
        let num_predict = self.num_predict.map(|value| value.max(0) as usize);
        match provider {
            ProviderTypeData::Ollama => Params::Ollama(OllamaParams {
                temperature: self.temperature,
                seed,
                top_p: self.top_p,
                top_k,
                min_p: self.min_p,
                stop,
                num_ctx: self.num_ctx.map(|value| value.max(0) as usize),
                num_predict,
                think: self.think,
            }),
            ProviderTypeData::GigaChat => Params::GigaChat(GigaChatParams {
                temperature: self.temperature,
                seed,
                top_p: self.top_p,
                num_predict,
                reasoning_effort: self.effort.as_deref().and_then(Effort::parse),
                reasoning_max_tokens: self.reasoning_max_tokens.map(|value| value.max(0) as u64),
                ..Default::default()
            }),
            _ => Params::OpenAi(OpenAiParams {
                temperature: self.temperature,
                seed,
                top_p: self.top_p,
                top_k,
                min_p: self.min_p,
                stop,
                num_predict,
                reasoning_effort: self.effort.as_deref().and_then(Effort::parse),
            }),
        }
    }
}
