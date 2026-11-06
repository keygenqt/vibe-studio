// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Provider catalog and LLM requests: the crate's public flat API.

//! Vibe Studio cluster — provider catalog and LLM requests.

mod compress;
mod data;
mod summary;
mod title;
mod translate;

use anyhow::Result;
use vibe_cluster::Cluster;
use vibe_cluster::ClusterError;
use vibe_cluster::ConnectionParams;
use vibe_cluster::HistoryMessage;
use vibe_cluster::Prompt;
use vibe_cluster::Role;

pub use data::ModelInfoData;
pub use data::ProviderInfoData;
pub use data::ProviderTypeData;
pub use data::StreamAnswerData;
pub use data::StreamEvent;

pub use vibe_cluster::CancelToken;
pub use vibe_cluster::count_tokens;

/// Catalog of supported provider kinds — the source for the add form.
pub fn get_providers() -> Vec<ProviderInfoData> {
    ProviderTypeData::ALL
        .iter()
        .copied()
        .map(ProviderInfoData::from)
        .collect()
}

/// The provider type for a kind id from the state; None = unknown kind.
pub fn get_provider_by_kind(kind: &str) -> Option<ProviderTypeData> {
    ProviderTypeData::ALL
        .iter()
        .copied()
        .find(|provider| ProviderInfoData::from(*provider).provider == kind)
}

/// Fetches the live model catalog from a provider host. Embedding models are filtered out — they cannot serve prompts.
pub async fn get_provider_models_by_type(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
) -> Result<Vec<ModelInfoData>> {
    let client = vibe_cluster::create_client(ConnectionParams {
        provider: provider.into(),
        host: host.to_string(),
        api_key: api_key.map(String::from),
        project: project.map(String::from),
        ..Default::default()
    });

    let models = client.list_models().await?;
    Ok(models
        .into_iter()
        .filter(|model| model.embedding != Some(true))
        .map(ModelInfoData::from)
        .collect())
}

/// Runs one prompt on one host+model with the given generation config
/// and the conversation history; returns the response text. The
/// history is (role, content, images) triples — "user" |
/// "assistant", oldest first; the images are the turn's base64
/// parts. Errors keep the cluster's message.
pub async fn call_prompt(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    temperature: f64,
    seed: i64,
    num_ctx: i32,
    num_predict: i32,
    system: Option<String>,
    images: Option<Vec<String>>,
    history: Vec<(String, String, Vec<String>)>,
    user: &str,
) -> Result<String> {
    // config bounds are validated in core; the casts keep u64 happy
    let cluster = Cluster::new(vec![ConnectionParams {
        provider: provider.into(),
        host: host.to_string(),
        model: model.to_string(),
        temperature: Some(temperature),
        seed: Some(seed.max(0) as u64),
        num_ctx: Some(num_ctx.max(0) as usize),
        num_predict: Some(num_predict.max(0) as usize),
        api_key: api_key.map(String::from),
        project: project.map(String::from),
        stats: false,
        ..Default::default()
    }])?;

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

    let result = cluster.call(prompt).await?;
    Ok(result.text.unwrap_or_default())
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
    temperature: f64,
    seed: i64,
    num_ctx: i32,
    num_predict: i32,
    system: Option<String>,
    images: Option<Vec<String>>,
    history: Vec<(String, String, Vec<String>)>,
    user: &str,
    cancel: &CancelToken,
    on_event: impl Fn(&StreamEvent) + Send + Sync + 'static,
) -> Result<StreamAnswerData> {
    // config bounds are validated in core; the casts keep u64 happy
    let cluster = Cluster::new(vec![ConnectionParams {
        provider: provider.into(),
        host: host.to_string(),
        model: model.to_string(),
        temperature: Some(temperature),
        seed: Some(seed.max(0) as u64),
        num_ctx: Some(num_ctx.max(0) as usize),
        num_predict: Some(num_predict.max(0) as usize),
        api_key: api_key.map(String::from),
        project: project.map(String::from),
        stats: true,
        ..Default::default()
    }])?;

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

    let result = cluster
        .call_stream(prompt, cancel, move |event| match event {
            vibe_cluster::PromptEvent::Thinking(chunk) => on_event(&StreamEvent::Thinking(chunk.clone())),
            vibe_cluster::PromptEvent::Text(chunk) => on_event(&StreamEvent::Text(chunk.clone())),
        })
        .await?;

    match result.error {
        Some(ClusterError::Cancelled) => Ok(StreamAnswerData {
            text: result.text.unwrap_or_default(),
            thinking: result.thinking,
            cancelled: true,
            completion_tokens: result.completion_tokens,
        }),
        // a failed stream is an error, not an empty answer
        Some(error) => Err(error.into()),
        None => Ok(StreamAnswerData {
            text: result.text.unwrap_or_default(),
            thinking: result.thinking,
            cancelled: false,
            completion_tokens: result.completion_tokens,
        }),
    }
}

/// Translates one text to the given language with the translation
/// task config; returns the trimmed translation.
pub async fn call_translate(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    language: &str,
    text: &str,
) -> Result<String> {
    translate::call(provider, host, api_key, project, model, language, text).await
}

/// Streams the translation of one text: only the text deltas go to
/// `on_delta` — thinking stays out; returns the full trimmed answer.
pub async fn call_translate_stream(
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
    translate::call_stream(
        provider, host, api_key, project, model, language, text, cancel, on_delta,
    )
    .await
}

/// Summarizes one text with the light task config: a brief plain-text
/// digest in the language of the text itself. The answer is trimmed
/// to its first line and capped to 200 chars (unicode), closed with `…`.
pub async fn call_summary(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    text: &str,
) -> Result<String> {
    summary::call(provider, host, api_key, project, model, text).await
}

/// Streams the compression of one conversation into a context base
/// for continuing the session: the deltas go to `on_event` as they
/// arrive, the aggregated answer with the reasoning comes back. The
/// config is the task's own — the task never uses the model's
/// generation settings. The conversation goes as the prompt history
/// — `(role, content, images)` triples, "user" | "assistant",
/// oldest first; the compress images stay placeholders.
pub async fn call_compress(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    history: Vec<(String, String, Vec<String>)>,
    cancel: &CancelToken,
    on_event: impl Fn(&StreamEvent) + Send + Sync + 'static,
) -> Result<StreamAnswerData> {
    compress::call_stream(provider, host, api_key, project, model, history, cancel, on_event).await
}

/// Names a chat by its conversation: the messages go as the prompt
/// history, the model answers with the name only — `previous` is the
/// name to differ from. The config is the function's own — the task
/// never uses the model's generation settings. The answer is trimmed
/// to its first line and capped to 50 chars (unicode), closed with `…`.
pub async fn call_chat_name(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    history: Vec<(String, String)>,
    language: &str,
    previous: &str,
) -> Result<String> {
    title::call(provider, host, api_key, project, model, history, language, previous).await
}
