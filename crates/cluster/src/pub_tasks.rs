// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The published task calls: one wrapper per ready task.

//! The published calls of the ready tasks: the wrappers live here,
//! the prompts stay with the tasks.

use anyhow::Result;
use vibe_cluster::CancelToken;

use crate::data::CallParamsData;
use crate::data::ProviderTypeData;
use crate::data::StreamEventData;
use crate::data::StreamResultData;
use crate::data::StreamStatusData;
use crate::tasks::chat_name;
use crate::tasks::compress;
use crate::tasks::summary;
use crate::tasks::translate;

/// Streams the compression of one conversation into a context base
/// for continuing the session: the deltas go to `on_event` as they
/// arrive, the aggregated answer with the reasoning comes back. The
/// conversation goes as the prompt history.
pub async fn task_compress(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    history: Vec<(String, String, Vec<String>)>,
    cancel: &CancelToken,
    on_event: impl Fn(&StreamEventData) + Send + Sync + 'static,
) -> Result<StreamResultData> {
    compress::call_stream(
        provider, host, api_key, project, model, params, history, cancel, on_event,
    )
    .await
}

/// Summarizes one text with the light task config: a brief plain-text
/// digest in the language of the text itself. Returns the trimmed
/// summary with the provider-reported token facts — the answer is
/// trimmed to its first line and capped to 200 chars (unicode),
/// closed with `…`.
pub async fn task_summary(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    text: &str,
) -> Result<(String, StreamStatusData)> {
    summary::call(provider, host, api_key, project, model, params, text).await
}

/// Names a chat by its conversation: the messages go as the prompt
/// history, the model answers with the name only — `previous` is the
/// name to differ from. The answer is trimmed to its first line and
/// capped to 50 chars (unicode), closed with `…`.
pub async fn task_chat_name(
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
    chat_name::call(
        provider, host, api_key, project, model, params, history, language, previous,
    )
    .await
}

/// Translates one text to the given language with the given task
/// config; returns the trimmed translation with the
/// provider-reported token facts.
pub async fn task_translate(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    language: &str,
    text: &str,
) -> Result<(String, StreamStatusData)> {
    translate::call(provider, host, api_key, project, model, params, language, text).await
}

/// Streams the translation of one text: only the text deltas go to
/// `on_delta` — thinking stays out; returns the full trimmed answer
/// with the provider-reported token facts.
pub async fn task_translate_stream(
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
    translate::call_stream(
        provider, host, api_key, project, model, params, language, text, cancel, on_delta,
    )
    .await
}
