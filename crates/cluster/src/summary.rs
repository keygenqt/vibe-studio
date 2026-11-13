// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The chat answer summary task: the prompt and the call.

//! The answer summary task: a brief plain-text digest of one model
//! answer, answered in the language of the text itself. The config
//! arrives with the call — the model's catalog defaults.

use anyhow::Result;

use crate::CallParamsData;
use crate::ProviderTypeData;
use crate::StreamStatsData;
use crate::call_prompt;

// the summary instruction: compress the text to the same meaning in
// fewer words; the language follows the text itself
const SUMMARY_PROMPT: &str = "Compress the text: same meaning, fewer words. Keep all key facts and the question if there is one. Do not answer, do not add anything. Be brief: at most 500 characters. Reply in the language of the text with the compressed text only. Do not use markdown or any other formatting, plain text only. The text:\n\n{text}";

/// Summarizes one model answer; returns the trimmed summary with the
/// provider-reported token facts.
pub(crate) async fn call(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    text: &str,
) -> Result<(String, StreamStatsData)> {
    let (summary, stats) = call_prompt(
        provider,
        host,
        api_key,
        project,
        model,
        params,
        None,
        None,
        Vec::new(),
        &SUMMARY_PROMPT.replace("{text}", text),
    )
    .await?;
    let summary = summary.trim().lines().next().unwrap_or("").trim();
    Ok((summary.to_owned(), stats))
}
