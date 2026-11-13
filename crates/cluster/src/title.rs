// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The chat naming task: the prompt and the call.

//! The chat naming task: the model answers with the title only. The
//! config arrives with the call — the model's catalog defaults.

use anyhow::Result;

use crate::CallParamsData;
use crate::ProviderTypeData;
use crate::call_prompt;

// the title cap: a longer model answer is cut to this many chars
// and closed with `…`
const TITLE_MAX_CHARS: usize = 50;

// the templates with `{language}` and `{previous}` replaced at the call
const TITLE_PROMPT: &str = "Name this chat based on the messages. The title must be at most three words, written in {language}. The previous title was \"{previous}\" — the new title must differ from it. Answer with the title only: no quotes, no punctuation, no markdown, plain text.";

/// Names a chat by its conversation; returns the trimmed title — the
/// first line capped to 50 chars (unicode), closed with `…`.
pub(crate) async fn call(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    history: Vec<(String, String)>,
    language: &str,
    previous: &str,
) -> Result<String> {
    let prompt = TITLE_PROMPT
        .replace("{language}", language)
        .replace("{previous}", previous);
    let (name, _) = call_prompt(
        provider,
        host,
        api_key,
        project,
        model,
        params,
        None,
        None,
        history
            .into_iter()
            .map(|(role, content)| (role, content, Vec::new()))
            .collect(),
        &prompt,
    )
    .await?;
    let name = name.trim().lines().next().unwrap_or("").trim();
    let cut: String = name.chars().take(TITLE_MAX_CHARS).collect();
    if cut.chars().count() < name.chars().count() {
        Ok(format!("{cut}…"))
    } else {
        Ok(cut)
    }
}
