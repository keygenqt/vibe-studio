// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The raw LLM call primitive: connection, prompt assembly, plain and streaming call.

//! The raw LLM call primitive: one prompt on one host+model, plain
//! and streaming. The ready tasks build on it.

use anyhow::Result;
use vibe_cluster::CancelToken;
use vibe_cluster::Cluster;
use vibe_cluster::ClusterError;
use vibe_cluster::Connection;
use vibe_cluster::HistoryMessage;
use vibe_cluster::Prompt;
use vibe_cluster::Role;

use crate::data::CallParamsData;
use crate::data::ProviderTypeData;
use crate::data::StreamEventData;
use crate::data::StreamResultData;
use crate::data::StreamStatusData;

/// The cluster connection of a call: the generation config lands in
/// the params of the provider family — `num_ctx` exists only in the
/// Ollama schema, the cloud families do not carry it.
fn connection(
    provider: ProviderTypeData,
    host: &str,
    model: &str,
    params: CallParamsData,
    api_key: Option<&str>,
    project: Option<&str>,
) -> Connection {
    Connection {
        provider: provider.into(),
        host: host.to_string(),
        model: model.to_string(),
        params: params.to_params(provider),
        api_key: api_key.map(String::from),
        project: project.map(String::from),
        ..Default::default()
    }
}

/// The prompt of a call: the history is (role, content, images)
/// triples — "user" | "assistant", oldest first; the images are the
/// turn's base64 parts.
fn prompt(
    user: &str,
    system: Option<String>,
    images: Option<Vec<String>>,
    history: Vec<(String, String, Vec<String>)>,
) -> Prompt {
    let mut prompt = Prompt::new(user, system, images);
    prompt.history = history
        .into_iter()
        .map(|(role, content, images)| HistoryMessage {
            role: match role.as_str() {
                "assistant" => Role::Assistant,
                _ => Role::User,
            },
            content,
            images,
        })
        .collect();
    prompt
}

/// Runs one prompt on one host+model with the given generation config
/// and the conversation history; returns the response text with the
/// provider-reported token facts — what the provider did not report
/// stays `None`. Errors keep the cluster's message.
pub async fn call_prompt(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    system: Option<String>,
    images: Option<Vec<String>>,
    history: Vec<(String, String, Vec<String>)>,
    user: &str,
) -> Result<(String, StreamStatusData)> {
    let cluster = Cluster::new(vec![connection(provider, host, model, params, api_key, project)])?;
    let result = cluster.call(prompt(user, system, images, history)).await?;
    let stats = result.stats.map(StreamStatusData::from).unwrap_or_default();
    Ok((result.text.unwrap_or_default(), stats))
}

/// Streams one prompt on one host+model with the given generation
/// config and the conversation history. The deltas go to `on_event`
/// as they arrive; the aggregated answer comes back — on cancel it
/// carries the partial text. Errors keep the cluster's message.
pub async fn call_prompt_stream(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    params: CallParamsData,
    system: Option<String>,
    images: Option<Vec<String>>,
    history: Vec<(String, String, Vec<String>)>,
    user: &str,
    cancel: &CancelToken,
    on_event: impl Fn(&StreamEventData) + Send + Sync + 'static,
) -> Result<StreamResultData> {
    let cluster = Cluster::new(vec![connection(provider, host, model, params, api_key, project)])?;

    let result = cluster
        .call_stream(prompt(user, system, images, history), cancel, move |event| {
            match event {
                vibe_cluster::PromptEvent::Thinking(chunk) => on_event(&StreamEventData::Thinking(chunk.clone())),
                vibe_cluster::PromptEvent::Text(chunk) => on_event(&StreamEventData::Text(chunk.clone())),
                // the usage event is intercepted into the result by the cluster
                _ => {}
            }
        })
        .await?;

    let stats = result.stats.map(StreamStatusData::from);
    match result.error {
        Some(ClusterError::Cancelled) => Ok(StreamResultData {
            text: result.text.unwrap_or_default(),
            thinking: result.thinking,
            cancelled: true,
            stats,
        }),
        // a failed stream is an error, not an empty answer
        Some(error) => Err(error.into()),
        None => Ok(StreamResultData {
            text: result.text.unwrap_or_default(),
            thinking: result.thinking,
            cancelled: false,
            stats,
        }),
    }
}
