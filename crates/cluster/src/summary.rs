// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The chat answer summary task: the prompt, the task config and the call.

//! The answer summary task: a brief plain-text digest of one model
//! answer, answered in the language of the text itself. The config is
//! the task's own — the task never uses the model's generation
//! settings.

use anyhow::Result;

use crate::ProviderTypeData;
use crate::call_prompt;

const SUMMARY_TEMPERATURE: f64 = 0.7;
const SUMMARY_SEED: i64 = 42;
const SUMMARY_NUM_CTX: i32 = 8192;
const SUMMARY_NUM_PREDICT: i32 = 8192;

// the summary instruction: compress the text to the same meaning in
// fewer words; the language follows the text itself
const SUMMARY_PROMPT: &str = "Compress the text: same meaning, fewer words. Keep all key facts and the question if there is one. Do not answer, do not add anything. Be brief: at most 500 characters. Reply in the language of the text with the compressed text only. Do not use markdown or any other formatting, plain text only. The text:\n\n{text}";

/// Summarizes one model answer; returns the trimmed summary.
pub(crate) async fn call(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    text: &str,
) -> Result<String> {
    let summary = call_prompt(
        provider,
        host,
        api_key,
        project,
        model,
        SUMMARY_TEMPERATURE,
        SUMMARY_SEED,
        SUMMARY_NUM_CTX,
        SUMMARY_NUM_PREDICT,
        None,
        Vec::new(),
        &SUMMARY_PROMPT.replace("{text}", text),
    )
    .await?;
    let summary = summary.trim().lines().next().unwrap_or("").trim();
    Ok(summary.to_owned())
}
