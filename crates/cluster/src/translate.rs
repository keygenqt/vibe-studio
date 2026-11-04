// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The translation task: the prompt, the task config and the two call variants.

//! The translation task: one text to one language. The config is
//! the task's own — the task never uses the model's generation
//! settings.

use anyhow::Result;

use crate::CancelToken;
use crate::ProviderTypeData;
use crate::StreamEvent;
use crate::call_prompt;
use crate::call_prompt_stream;

const TRANSLATE_TEMPERATURE: f64 = 0.7;
const TRANSLATE_SEED: i64 = 42;
const TRANSLATE_NUM_CTX: i32 = 8192;
const TRANSLATE_NUM_PREDICT: i32 = 8192;

// the shared prompt of both variants: `{language}` is replaced at
// the call site
const TRANSLATE_PROMPT: &str = "Translate the text to {language}. Answer with the translation only: keep the original formatting, no explanations.";

/// Translates one text to the given language; returns the trimmed
/// translation.
pub(crate) async fn call(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    language: &str,
    text: &str,
) -> Result<String> {
    let prompt = TRANSLATE_PROMPT.replace("{language}", language);
    let text = call_prompt(
        provider,
        host,
        api_key,
        project,
        model,
        TRANSLATE_TEMPERATURE,
        TRANSLATE_SEED,
        TRANSLATE_NUM_CTX,
        TRANSLATE_NUM_PREDICT,
        Some(prompt),
        Vec::new(),
        text,
    )
    .await?;
    Ok(text.trim().to_string())
}

/// Streams the translation of one text: only the text deltas go to
/// `on_delta` — thinking stays out; returns the full trimmed answer.
pub(crate) async fn call_stream(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    language: &str,
    text: &str,
    cancel: &CancelToken,
    on_delta: impl Fn(&str) + Send + Sync + 'static,
) -> Result<String> {
    let prompt = TRANSLATE_PROMPT.replace("{language}", language);
    let result = call_prompt_stream(
        provider,
        host,
        api_key,
        project,
        model,
        TRANSLATE_TEMPERATURE,
        TRANSLATE_SEED,
        TRANSLATE_NUM_CTX,
        TRANSLATE_NUM_PREDICT,
        Some(prompt),
        Vec::new(),
        text,
        cancel,
        move |event| {
            // thinking stays out: the translation is text only
            if let StreamEvent::Text(chunk) = event {
                on_delta(chunk);
            }
        },
    )
    .await?;
    Ok(result.text.trim().to_string())
}
