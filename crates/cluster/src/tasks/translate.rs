// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The translation task: the prompt and the two call variants.

//! The translation task: one text to one language. The config
//! arrives with the call — the model's catalog defaults.

use anyhow::Result;
use vibe_cluster::CancelToken;

use crate::data::CallParamsData;
use crate::data::ProviderTypeData;
use crate::data::StreamEventData;
use crate::data::StreamStatusData;
use crate::pub_call::call_prompt;
use crate::pub_call::call_prompt_stream;

// the shared prompt of both variants: `{language}` is replaced at
// the call site
const TRANSLATE_PROMPT: &str = "Translate the text to {language}. Answer with the translation only: keep the original formatting, no explanations.";

/// Translates one text to the given language; returns the trimmed
/// translation with the provider-reported token facts.
pub(crate) async fn call(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    language: &str,
    text: &str,
) -> Result<(String, StreamStatusData)> {
    let prompt = TRANSLATE_PROMPT.replace("{language}", language);
    let (text, stats) = call_prompt(
        provider,
        host,
        api_key,
        project,
        model,
        params,
        Some(prompt),
        None,
        Vec::new(),
        text,
    )
    .await?;
    Ok((text.trim().to_string(), stats))
}

/// Streams the translation of one text: only the text deltas go to
/// `on_delta` — thinking stays out; returns the full trimmed answer
/// with the provider-reported token facts.
pub(crate) async fn call_stream(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    language: &str,
    text: &str,
    cancel: &CancelToken,
    on_delta: impl Fn(&str) + Send + Sync + 'static,
) -> Result<(String, StreamStatusData)> {
    let prompt = TRANSLATE_PROMPT.replace("{language}", language);
    let result = call_prompt_stream(
        provider,
        host,
        api_key,
        project,
        model,
        params,
        Some(prompt),
        None,
        Vec::new(),
        text,
        cancel,
        move |event| {
            // thinking stays out: the translation is text only
            if let StreamEventData::Text(chunk) = event {
                on_delta(chunk);
            }
        },
    )
    .await?;
    let stats = result.stats.map(StreamStatusData::from).unwrap_or_default();
    Ok((result.text.trim().to_string(), stats))
}
