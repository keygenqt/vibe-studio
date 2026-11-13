// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme', 'facts']
// INFO: Vibe Studio core: facade over sub-crates — the single API for UI shells.

//! Vibe Studio core — facade over sub-crates. UI shells talk to this
//! crate only.

use anyhow::Result;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use studio_cluster::CancelToken;

use data::TranslateTargetData;

pub use studio_cluster::StreamEvent;

mod attachment;
mod browser;
mod clipboard;
mod data;
mod defaults;
mod stream;
pub(crate) mod theme;
mod utils;

pub use attachment::AttachmentStatData;
pub use attachment::ChatAttachmentInput;
pub use data::ChatStreamEvent;
pub use data::ClipboardRead;
pub use defaults::models::ModelDefaultsData;
pub use studio_cluster::ModelInfoData;
pub use studio_cluster::ProviderInfoData;
pub use studio_states::ChatData;
pub use studio_states::ChatHistoryData;
pub use studio_states::ChatMessageType;
pub use studio_states::ChatShowType;
pub use studio_states::ChatStatus;
pub use studio_states::GroupChatData;
pub use studio_states::GroupChatHistoryData;
pub use studio_states::ProviderData;
pub use studio_states::ProviderModelData;
pub use studio_states::SettingsData;
pub use studio_states::Store;
pub use studio_states::WorkspaceData;

pub use theme::ThemeChoice;

// ─────────────────────────────────────────────
// Workspace
// ─────────────────────────────────────────────

/// Loads the shell environment; a missing row falls back to `Default`
/// — untouched values stay `None`.
pub fn get_workspace(store: &Store) -> WorkspaceData {
    studio_states::get_workspace(store).unwrap_or_default()
}

/// Persists the shell environment as the single row, returns it.
pub fn save_workspace(store: &Store, workspace: &WorkspaceData) -> Result<WorkspaceData> {
    studio_states::save_workspace(store, workspace)
}

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────

/// Loads the user preferences; a missing row falls back to `Default`.
/// Stale model references arrive already resolved to `null` — the
/// states layer guarantees it. A store error yields the defaults —
/// loading never blocks the UI.
pub fn get_settings(store: &Store) -> SettingsData {
    studio_states::get_settings(store).unwrap_or_default()
}

/// Persists the user preferences as the single row. The UI is not
/// trusted: a set model id must exist, the context limit stays in
/// bounds; theme, locale and accent are stored as sent.
pub fn save_settings(store: &Store, settings: &SettingsData) -> Result<SettingsData> {
    for id in [
        settings.tasks_model_light,
        settings.tasks_model_heavy,
        settings.translation_model,
    ] {
        if let Some(id) = id {
            if studio_states::get_provider_model(store, id).is_err() {
                anyhow::bail!("Unknown model.");
            }
        }
    }
    if settings
        .chat_context_limit
        .is_some_and(|value| !(1..=2000).contains(&value))
    {
        anyhow::bail!("Context limit must be between 1 and 2000.");
    }
    studio_states::save_settings(store, settings)
}

// ─────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────

/// Catalog of supported provider types — the single source for the
/// add form and for validation.
pub fn get_providers_catalog() -> Vec<ProviderInfoData> {
    studio_cluster::get_providers()
}

/// All configured providers; a store error yields an empty list —
/// loading never blocks the UI.
pub fn get_providers(store: &Store) -> Vec<ProviderData> {
    studio_states::get_providers(store).unwrap_or_default()
}

/// Loads one provider by id.
pub fn get_provider(store: &Store, id: i32) -> Result<ProviderData> {
    studio_states::get_provider(store, id)
}

/// Validates against the cluster catalog, then inserts or updates.
/// The UI is not trusted: the kind must match the catalog exactly,
/// blank name and host are errors; everything else is stored as sent.
pub fn save_provider(store: &Store, provider: &ProviderData) -> Result<ProviderData> {
    if studio_cluster::get_provider_by_kind(&provider.provider).is_none() {
        anyhow::bail!("Unknown provider.");
    }
    if provider.name.trim().is_empty() {
        anyhow::bail!("Name must not be blank.");
    }
    if provider.host.trim().is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    studio_states::save_provider(store, provider)
}

/// Deletes the provider; a missing row is a no-op.
pub fn delete_provider(store: &Store, id: i32) -> Result<()> {
    studio_states::delete_provider(store, id)?;
    Ok(())
}

/// All models, optionally of one provider; a store error yields an
/// empty list — loading never blocks the UI.
pub fn get_provider_models(store: &Store, provider_id: Option<i32>) -> Vec<ProviderModelData> {
    studio_states::get_provider_models(store, provider_id).unwrap_or_default()
}

/// Loads one model by id.
pub fn get_provider_model(store: &Store, id: i32) -> Result<ProviderModelData> {
    studio_states::get_provider_model(store, id)
}

/// The parameter spec of the model: the defaults a fresh row is born
/// with and the bounds the form and the save validation enforce. The
/// kind is not trusted: must be in the catalog; the exact name match
/// wins, everything else is the base of the family.
pub fn get_model_defaults(kind: &str, name: &str) -> Result<ModelDefaultsData> {
    let provider =
        studio_cluster::get_provider_by_kind(kind).ok_or_else(|| anyhow::anyhow!("Unknown provider kind: {kind}."))?;
    Ok(defaults::models::resolve(provider, name))
}

/// Fetches the live model catalog of a provider host. The kind is not
/// trusted: must be in the catalog; the host is trimmed, blank is an
/// error. Embedding models are filtered out on the cluster layer.
pub async fn get_provider_models_by_type(
    kind: &str,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
) -> Result<Vec<ModelInfoData>> {
    let host = host.trim();
    if host.is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    let provider =
        studio_cluster::get_provider_by_kind(kind).ok_or_else(|| anyhow::anyhow!("Unknown provider kind: {kind}."))?;
    Ok(studio_cluster::get_provider_models_by_type(provider, host, api_key, project).await?)
}

/// Validates and persists the model. The UI is not trusted: the id
/// must exist, whitespace-only texts are errors, the config values
/// must fit the bounds of the model's catalog entry; everything else
/// is stored as sent.
pub fn save_provider_model(store: &Store, model: &ProviderModelData) -> Result<ProviderModelData> {
    let Some(id) = model.id else {
        anyhow::bail!("Model id is required.");
    };
    let stored = studio_states::get_provider_model(store, id)?;
    if !model.display_name.is_empty() && model.display_name.trim().is_empty() {
        anyhow::bail!("Display name must not be blank.");
    }
    if !model.system_prompt.is_empty() && model.system_prompt.trim().is_empty() {
        anyhow::bail!("System prompt must not be blank.");
    }
    let provider = studio_states::get_provider(store, stored.provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let spec = defaults::models::resolve(kind, &model.name);
    let in_range = |value: f64, spec: defaults::models::ModelParamSpec| {
        spec.min.is_none_or(|min| value >= min) && spec.max.is_none_or(|max| value <= max)
    };
    if let Some(spec) = spec.temperature {
        if !in_range(model.temperature, spec) {
            anyhow::bail!("Temperature is out of range.");
        }
    }
    if let Some(spec) = spec.seed {
        if !in_range(model.seed as f64, spec) {
            anyhow::bail!("Seed is out of range.");
        }
    }
    if let Some(spec) = spec.top_p {
        if !in_range(model.top_p, spec) {
            anyhow::bail!("Top p is out of range.");
        }
    }
    if let Some(spec) = spec.top_k {
        if !in_range(model.top_k as f64, spec) {
            anyhow::bail!("Top k is out of range.");
        }
    }
    if let Some(spec) = spec.min_p {
        if !in_range(model.min_p, spec) {
            anyhow::bail!("Min p is out of range.");
        }
    }
    if let Some(spec) = spec.num_ctx {
        if !in_range(model.num_ctx as f64, spec) {
            anyhow::bail!("Num ctx is out of range.");
        }
        if let Some(limit) = stored.context_length {
            if model.num_ctx > limit as i32 {
                anyhow::bail!("Num ctx must not exceed the model context window.");
            }
        }
    }
    if let Some(spec) = spec.num_predict {
        if !in_range(model.num_predict as f64, spec) {
            anyhow::bail!("Num predict is out of range.");
        }
    }
    // the effort value must be one of the model's catalog steps; a
    // model without a catalog entry keeps the universal low/high
    if let Some(value) = &model.effort {
        let known = match &spec.effort {
            Some(spec) => spec.values.iter().any(|item| item == value),
            None => matches!(value.as_str(), "low" | "high"),
        };
        if !known {
            anyhow::bail!("Unknown effort value.");
        }
    }
    if let Some(spec) = spec.reasoning_max_tokens {
        if let Some(value) = model.reasoning_max_tokens {
            if !in_range(value as f64, spec) {
                anyhow::bail!("Reasoning max tokens is out of range.");
            }
        }
    }
    studio_states::save_provider_model(store, model)
}

/// Persists the selection of one provider's model catalog: fetches
/// the live list from the host and upserts the selected models with
/// fresh facts; models outside the selection are removed. The UI
/// sends only the provider id and the selected names. A model new to
/// the table is born with the defaults of its catalog entry; a known
/// one keeps its stored config — the sync refreshes the facts only.
/// A fetch error aborts before any mutation — a failed sync never
/// touches the table. An empty selection is valid.
pub async fn save_provider_models(
    store: &Store,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<ProviderModelData>> {
    let provider = studio_states::get_provider(store, provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let models = crate::get_provider_models_by_type(
        &provider.provider,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
    )
    .await?;
    let stored = studio_states::get_provider_models(store, Some(provider_id))?;
    let rows: Vec<ProviderModelData> = models
        .into_iter()
        .filter(|model| checked.iter().any(|name| *name == model.name))
        .map(|model| match stored.iter().find(|row| row.name == model.name) {
            // the stored row keeps its config, the sync refreshes the facts
            Some(row) => ProviderModelData {
                params: model.params,
                context_length: model.context_length.map(|value| value as i64),
                capabilities: serde_json::to_value(model.capabilities).ok(),
                ..row.clone()
            },
            // a fresh row is born with its catalog defaults
            None => {
                let spec = defaults::models::resolve(kind, &model.name);
                // think is born on for a reasoning-capable Ollama
                // model: the UI carries only the on/off choice
                let think = if matches!(kind, studio_cluster::ProviderTypeData::Ollama)
                    && matches!(model.capabilities.effort, Some(true))
                {
                    Some(true)
                } else {
                    None
                };
                ProviderModelData {
                    id: None,
                    provider_id,
                    name: model.name,
                    params: model.params,
                    context_length: model.context_length.map(|value| value as i64),
                    capabilities: serde_json::to_value(model.capabilities).ok(),
                    display_name: String::new(),
                    system_prompt: String::new(),
                    temperature: spec.temperature.map(|spec| spec.default).unwrap_or(0.0),
                    seed: spec.seed.map(|spec| spec.default).unwrap_or(0.0) as i64,
                    top_p: spec.top_p.map(|spec| spec.default).unwrap_or(0.0),
                    top_k: spec.top_k.map(|spec| spec.default as i32).unwrap_or(0),
                    min_p: spec.min_p.map(|spec| spec.default).unwrap_or(0.0),
                    stop: Vec::new(),
                    num_ctx: spec.num_ctx.map(|spec| spec.default as i32).unwrap_or(0),
                    num_predict: spec.num_predict.map(|spec| spec.default as i32).unwrap_or(0),
                    // effort is born with the catalog default of the
                    // model; reasoning_max_tokens stays untouched — the
                    // provider defaults apply until the user picks
                    effort: spec.effort.as_ref().map(|spec| spec.default.clone()),
                    reasoning_max_tokens: spec.reasoning_max_tokens.map(|spec| spec.default as i32),
                    think,
                }
            }
        })
        .collect();
    studio_states::save_provider_models(store, provider_id, &rows)
}

// ─────────────────────────────────────────────
// Groups Chat
// ─────────────────────────────────────────────

/// All chat groups; a store error yields an empty list — loading
/// never blocks the UI.
pub fn get_groups_chat(store: &Store) -> Vec<GroupChatData> {
    studio_states::get_groups_chat(store).unwrap_or_default()
}

/// Loads one group by id.
pub fn get_group_chat(store: &Store, id: i32) -> Result<GroupChatData> {
    studio_states::get_group_chat(store, id)
}

/// Validates and persists the group. The UI is not trusted: a blank
/// name is an error, the model must exist; everything else is stored
/// as sent. A fresh group is born into the history active, an update
/// counts.
pub fn save_group_chat(store: &Store, group_chat: &GroupChatData) -> Result<GroupChatData> {
    if group_chat.name.trim().is_empty() {
        anyhow::bail!("Name must not be blank.");
    }
    if studio_states::get_provider_model(store, group_chat.model_id).is_err() {
        anyhow::bail!("Unknown model.");
    }
    let saved = studio_states::save_group_chat(store, group_chat)?;
    let id = saved.id.expect("stored group id");
    match group_chat.id {
        None => {
            studio_states::create_group_chat_history(store, id)?;
        }
        Some(_) => {
            studio_states::bump_group_chat_history_updates(store, id)?;
        }
    }
    Ok(saved)
}

/// Deletes the group with its chats and history; a missing group is
/// a no-op.
pub fn delete_group_chat(store: &Store, id: i32) -> Result<()> {
    for chat in studio_states::get_chats(store)?
        .iter()
        .filter(|chat| chat.group_chat_id == id)
    {
        studio_states::delete_chat_histories(store, chat.id.expect("stored chat id"))?;
    }
    studio_states::delete_group_chats(store, id)?;
    studio_states::delete_group_chat(store, id)?;
    studio_states::delete_group_chat_history(store, id)?;
    Ok(())
}

// ─────────────────────────────────────────────
// Chats
// ─────────────────────────────────────────────

/// All chats; a store error yields an empty list — loading never
/// blocks the UI.
pub fn get_chats(store: &Store) -> Vec<ChatData> {
    studio_states::get_chats(store).unwrap_or_default()
}

/// Loads one chat by id.
pub fn get_chat(store: &Store, id: i32) -> Result<ChatData> {
    studio_states::get_chat(store, id)
}

/// Validates and persists the chat. The UI is not trusted: the group
/// must exist; an empty name is filled with a random pool name on
/// the states layer. Everything else is stored as sent. A fresh chat
/// becomes the selected one of its group and counts as created.
pub fn save_chat(store: &Store, chat: &ChatData) -> Result<ChatData> {
    if studio_states::get_group_chat(store, chat.group_chat_id).is_err() {
        anyhow::bail!("Unknown group.");
    }
    let saved = studio_states::save_chat(store, chat)?;
    if chat.id.is_none() {
        let id = saved.id.expect("stored chat id");
        studio_states::set_active_group_chat(store, saved.group_chat_id, Some(id))?;
        studio_states::bump_group_chat_history_chats_created(store, saved.group_chat_id)?;
    }
    Ok(saved)
}

/// Renames the chat with a model-generated name: the light task
/// model names the chat by the compress base, or by the last four
/// messages — the previous name goes into the prompt so the fresh
/// one differs. The UI is not trusted: the chat must exist, the
/// light model must be set, the chat must have messages; a blank
/// answer is an error.
pub async fn chat_regenerate_name(store: &Store, chat_id: i32) -> Result<ChatData> {
    let chat = studio_states::get_chat(store, chat_id)?;
    let settings = studio_states::get_settings(store).unwrap_or_default();
    let Some(model_id) = settings.tasks_model_light else {
        anyhow::bail!("Task model is not set.");
    };
    let model = studio_states::get_provider_model(store, model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    let messages: Vec<ChatHistoryData> = studio_states::get_chat_histories(store, chat_id)?
        .into_iter()
        .filter(|message| message.status == ChatStatus::Complete)
        .collect();
    if messages.is_empty() {
        anyhow::bail!("Chat has no messages.");
    }
    // the name source: the compress base is the conversation's
    // summary — it wins; otherwise the last four messages speak
    let history: Vec<(String, String)> = match messages
        .iter()
        .find(|message| message.message_type == ChatMessageType::Compress)
    {
        Some(base) => vec![(utils::history_role(base), base.text.clone())],
        None => {
            let start = messages.len().saturating_sub(4);
            messages[start..]
                .iter()
                .map(|message| (utils::history_role(message), message.text.clone()))
                .collect()
        }
    };
    let language = utils::locale_language(&settings.appearance_locale);
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let name = studio_cluster::call_chat_name(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        studio_cluster::CallParamsData::from(defaults::models::resolve(kind, &model.name)),
        history,
        language,
        &chat.name,
    )
    .await?;
    if name.is_empty() {
        anyhow::bail!("Name must not be blank.");
    }
    studio_states::save_chat(store, &ChatData { name, ..chat })
}

/// Deletes the chat; a missing row is a no-op. If the deleted chat
/// was the selected one, the group falls back to its newest remaining
/// chat — the same as a group click; a chatless group keeps no chat.
pub fn delete_chat(store: &Store, id: i32) -> Result<()> {
    let chat = studio_states::get_chat(store, id).ok();
    studio_states::delete_chat(store, id)?;
    if let Some(chat) = chat {
        studio_states::delete_chat_histories(store, id)?;
        if studio_states::clear_group_chat_history_selected_chat(store, id)? != 0 {
            if let Some(last) = studio_states::get_last_group_chat(store, chat.group_chat_id)? {
                studio_states::set_active_group_chat(
                    store,
                    chat.group_chat_id,
                    Some(last.id.expect("stored chat id")),
                )?;
            }
        }
    }
    Ok(())
}

// ─────────────────────────────────────────────
// Chat History
// ─────────────────────────────────────────────

/// All messages of the chat, oldest first. The UI is not trusted:
/// the chat must exist.
pub fn chat_get_history(store: &Store, chat_id: i32) -> Result<Vec<ChatHistoryData>> {
    studio_states::get_chat(store, chat_id)?;
    Ok(studio_states::get_chat_histories(store, chat_id)?)
}

/// Resolves the translation task target from the settings: the
/// translation model with its provider. The language comes from the
/// settings field of the caller — the input goes to
/// `translation_mine`, the answers to `translation_answers`.
fn translate_target(store: &Store, locale: Option<&str>) -> Result<TranslateTargetData> {
    let settings = studio_states::get_settings(store).unwrap_or_default();
    let Some(model_id) = settings.translation_model else {
        anyhow::bail!("Translation model is not set.");
    };
    let Some(locale) = locale else {
        anyhow::bail!("Translation language is not set.");
    };
    let model = studio_states::get_provider_model(store, model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    Ok(TranslateTargetData {
        kind,
        host: provider.host,
        api_key: provider.api_key,
        project: provider.project,
        model: model.name,
        language: utils::locale_language(locale).to_string(),
    })
}

/// Sends the user's message to the chat's model and records both
/// sides of the exchange. The UI is not trusted: the chat must exist,
/// a blank message is an error. `translate` swaps the text for its
/// translation to the `translation_mine` language before anything is
/// stored — the row and the prompt carry the translation. The
/// attachments are validated and stored with the user message; the
/// prompt carries their content under the full paths — the stored
/// text stays clean, the stats reflect the files. The model
/// prompt comes first, the
/// group prompt completes it; empty prompts drop out. The answer is
/// born as a `Progress` row and grows in the store as the deltas
/// arrive; a failed request is finalized as an `Error` message, a
/// cancelled one — as `Cancelled` with the partial text.
pub async fn chat_send_message(
    store: &Store,
    chat_id: i32,
    text: &str,
    translate: bool,
    attachments: Vec<ChatAttachmentInput>,
    on_event: impl Fn(ChatStreamEvent) + Send + Sync + 'static,
) -> Result<()> {
    if text.trim().is_empty() && attachments.is_empty() {
        anyhow::bail!("Message must not be blank.");
    }
    studio_states::get_chat(store, chat_id)?;
    // the translation replaces the text before anything is stored:
    // a failed or empty translation leaves the history untouched
    let translated = if translate {
        let settings = studio_states::get_settings(store).unwrap_or_default();
        let target = translate_target(store, settings.translation_mine.as_deref())?;
        // the stats die here: the user row carries no token facts
        let (text, _) = studio_cluster::call_translate(
            target.kind,
            &target.host,
            target.api_key.as_deref(),
            target.project.as_deref(),
            &target.model,
            studio_cluster::CallParamsData::from(defaults::models::resolve(target.kind, &target.model)),
            &target.language,
            text,
        )
        .await?;
        if text.is_empty() {
            anyhow::bail!("Translation must not be blank.");
        }
        Some(text)
    } else {
        None
    };
    let text = translated.as_deref().unwrap_or(text);
    // everything is validated before anything is stored: a rejected
    // attachment never leaves a half-sent message behind
    let prepared = attachment::prepare(&attachments)?;
    // the images ride the vision models only — resolved before the
    // insert so the rejection stores nothing
    let images = if prepared.images.is_empty() {
        None
    } else {
        let chat = studio_states::get_chat(store, chat_id)?;
        let group = studio_states::get_group_chat(store, chat.group_chat_id)?;
        let model = studio_states::get_provider_model(store, group.model_id)?;
        if model
            .capabilities
            .as_ref()
            .and_then(|caps| caps.get("input_vision"))
            .and_then(serde_json::Value::as_bool)
            != Some(true)
        {
            anyhow::bail!("Model does not support images.");
        }
        Some(prepared.images.clone())
    };
    let prompt = format!("{text}{}", prepared.inline);
    // the message and its attachments land in one transaction: a
    // failed insert never leaves a half-sent message behind; the
    // token facts land only with the final write of the answer
    let user = studio_states::add_chat_message_attachments(store, chat_id, text, &prepared.rows)?;
    chat_send_stream(
        store,
        chat_id,
        &prompt,
        images,
        user.id.expect("stored user id"),
        on_event,
    )
    .await
}

/// Resends the user's message: everything below it is deleted and the
/// message goes through the send path again. The UI is not trusted:
/// the chat must exist, the message must belong to it and be a user
/// message — a model answer has no request of its own to repeat.
pub async fn chat_resend_message(
    store: &Store,
    chat_id: i32,
    message_id: i32,
    on_event: impl Fn(ChatStreamEvent) + Send + Sync + 'static,
) -> Result<()> {
    studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    let message = histories
        .iter()
        .find(|message| message.id == Some(message_id))
        .ok_or_else(|| anyhow::anyhow!("Unknown message."))?;
    if message.message_type != ChatMessageType::User {
        anyhow::bail!("Only a user message can be resent.");
    }
    studio_states::delete_chat_histories_after(store, chat_id, message_id)?;
    // the prompt is rebuilt from the stored bytes: the resend context
    // matches the original send whatever happened to the files
    let stored = attachment::prepare_stored(store, message)?;
    chat_send_stream(store, chat_id, &stored.prompt, stored.images, message_id, on_event).await
}

/// Deletes the message with everything below it — the later messages
/// lose their context, and the provider's prompt cache falls with the
/// prefix. The UI is not trusted: the chat must exist, the message
/// must belong to it. The running stream of the chat's model gives
/// way: its answer row goes with the tail.
pub fn chat_delete_message(store: &Store, chat_id: i32, message_id: i32) -> Result<()> {
    let chat = studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    if !histories.iter().any(|message| message.id == Some(message_id)) {
        anyhow::bail!("Unknown message.");
    }
    let group = studio_states::get_group_chat(store, chat.group_chat_id)?;
    let model = studio_states::get_provider_model(store, group.model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    utils::cancel_stream_token(&(provider.provider, model.name));
    // the in-flight summary of the dying message gives way
    utils::cancel_summary_token(message_id);
    studio_states::delete_chat_histories_from(store, chat_id, message_id)?;
    Ok(())
}

/// The send path shared by send and resend: resolves the chat's
/// model, yields a running stream of the same model, streams the
/// answer — the answer row is born with the stream and grows in the
/// store as the deltas arrive. The user message is already stored:
/// `skip_id` keeps it out of the context — it goes as the prompt.
async fn chat_send_stream(
    store: &Store,
    chat_id: i32,
    text: &str,
    images: Option<Vec<String>>,
    skip_id: i32,
    on_event: impl Fn(ChatStreamEvent) + Send + Sync + 'static,
) -> Result<()> {
    let chat = studio_states::get_chat(store, chat_id)?;
    // a running compress owns the chat: the send waits until it lands
    if studio_states::get_chat_histories(store, chat_id)?
        .iter()
        .any(|message| message.message_type == ChatMessageType::Compress && message.status == ChatStatus::Progress)
    {
        anyhow::bail!("Chat compression is in progress.");
    }
    let group = studio_states::get_group_chat(store, chat.group_chat_id)?;
    let model = studio_states::get_provider_model(store, group.model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let settings = studio_states::get_settings(store).unwrap_or_default();
    let streaming = settings.chat_streaming.unwrap_or(true);

    // a running stream of the same model gives way: its token is
    // cancelled, its own task finalizes the row and reports itself
    let key = (provider.provider.clone(), model.name.clone());
    if !studio_states::get_progress_chat_histories(store, &provider.provider, &model.name)?.is_empty() {
        utils::cancel_stream_token(&key);
    }

    // the model context: everything said so far, in order, minus the
    // stored user message — it goes as the prompt itself; only
    // complete messages count — failed and cut answers stay out
    let history = studio_states::get_chat_histories(store, chat_id)?
        .into_iter()
        .filter(|message| message.status == ChatStatus::Complete)
        .filter(|message| message.id != Some(skip_id))
        .map(|message| -> Result<(String, String, Vec<String>)> {
            let (content, images) = attachment::render_message_parts(store, &message)?;
            Ok((
                utils::history_role(&message),
                content,
                images.into_iter().map(|(_, data)| data).collect(),
            ))
        })
        .collect::<Result<Vec<_>>>()?;

    let system = [Some(model.system_prompt.as_str()), group.system_prompt.as_deref()]
        .into_iter()
        .flatten()
        .map(str::trim)
        .filter(|prompt| !prompt.is_empty())
        .collect::<Vec<_>>()
        .join("\n\n");

    // the full user prompt in the log: the shell-side inspection of
    // what the model receives — no truncation, the files ride inline
    log::debug!(
        "chat prompt [chat {chat_id}]: system {} chars, history {} messages, user prompt:\n{text}",
        system.chars().count(),
        history.len(),
    );

    // the answer row is born with the stream and grows in the store
    let answer = studio_states::add_chat_history(
        store,
        chat_id,
        ChatMessageType::Assistant,
        Some(provider.provider.as_str()),
        Some(model.name.as_str()),
        ChatStatus::Progress,
        "",
        None,
    )?;
    let answer_id = answer.id.expect("stored answer id");

    let cancel = utils::stream_token();
    utils::stream_tokens()
        .lock()
        .expect("stream tokens poisoned")
        .insert(key.clone(), cancel.clone());

    on_event(ChatStreamEvent::UserStored {
        chat: Some(chat),
        history: studio_states::get_chat_histories(store, chat_id).unwrap_or_default(),
    });

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below persists them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEvent>();
    let call = std::pin::pin!(studio_cluster::call_prompt_stream(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        studio_cluster::CallParamsData {
            temperature: Some(model.temperature),
            seed: Some(model.seed),
            top_p: Some(model.top_p),
            top_k: Some(model.top_k),
            min_p: Some(model.min_p),
            stop: Some(model.stop.clone()),
            num_ctx: Some(model.num_ctx),
            num_predict: Some(model.num_predict),
            effort: model.effort.clone(),
            reasoning_max_tokens: model.reasoning_max_tokens,
            think: model.think,
        },
        if system.is_empty() { None } else { Some(system) },
        images,
        history,
        text,
        cancel.as_ref(),
        {
            let tx = tx.clone();
            move |event| {
                if streaming {
                    let _ = tx.send(event.clone());
                }
            }
        },
    ));

    let mut text_acc = String::new();
    let mut thinking_acc = String::new();
    // the growing row persists at most once per 300 ms — token
    // streams must not turn into hundreds of UPDATEs per second
    const PERSIST_INTERVAL_MS: u64 = 300;
    let mut persisted_at = std::time::Instant::now();
    // one gate for the whole answer: the phases never mix, and a
    // shared gate can only delay a snapshot, never drop one
    let mut gate = stream::StreamGate::default();
    // the text generation window: from the first text delta to the
    // finalization — the thinking time stays out of the speed
    let mut gen_start: Option<std::time::Instant> = None;
    // one delta: grow the accumulators, persist the row, snapshot to the shell
    let handle = |event: StreamEvent| -> Result<()> {
        match &event {
            StreamEvent::Text(chunk) => {
                if gen_start.is_none() {
                    gen_start = Some(std::time::Instant::now());
                }
                text_acc.push_str(chunk);
                // the shell paints the balanced whole — the final
                // write is the authority
                if gate.pass(text_acc.len()) {
                    let snapshot = utils::close_open_fence(&text_acc).unwrap_or_else(|| text_acc.clone());
                    on_event(ChatStreamEvent::TextSnapshot(snapshot));
                }
            }
            StreamEvent::Thinking(chunk) => {
                thinking_acc.push_str(chunk);
                // thinking rides the same snapshot rule: the shell
                // replaces its copy, never accumulates
                if gate.pass(thinking_acc.len()) {
                    on_event(ChatStreamEvent::Thinking(thinking_acc.clone()));
                }
            }
        }
        let thinking = if thinking_acc.is_empty() {
            None
        } else {
            Some(thinking_acc.as_str())
        };
        if persisted_at.elapsed() >= std::time::Duration::from_millis(PERSIST_INTERVAL_MS) {
            persisted_at = std::time::Instant::now();
            // the interim write lands no tokens or timings
            studio_states::update_chat_history(
                store,
                answer_id,
                &text_acc,
                thinking,
                ChatStatus::Progress,
                None,
                None,
                None,
                None,
                None,
            )?;
        }
        Ok(())
    };
    let outcome = stream::pump(call, &mut rx, handle).await?;

    // the final write is the only authority: full text, thinking,
    // status and the provider-reported token facts — without the
    // report the columns stay `NULL`
    let (final_text, final_thinking, stats, status) = match outcome {
        Err(error) => (format!("{error}"), None, None, ChatStatus::Error),
        Ok(result) => {
            let status = if result.cancelled {
                ChatStatus::Cancelled
            } else {
                ChatStatus::Complete
            };
            (result.text, result.thinking, result.stats, status)
        }
    };
    let tokens_gen_ms = gen_start.map(|start| start.elapsed().as_millis() as i32);
    studio_states::update_chat_history(
        store,
        answer_id,
        &final_text,
        final_thinking.as_deref(),
        status,
        stats
            .as_ref()
            .and_then(|stats| stats.output_tokens.map(|value| value as i32)),
        stats
            .as_ref()
            .and_then(|stats| stats.thinking_tokens.map(|value| value as i32)),
        stats
            .as_ref()
            .and_then(|stats| stats.input_tokens.map(|value| value as i32)),
        stats
            .as_ref()
            .and_then(|stats| stats.cached_tokens.map(|value| value as i32)),
        tokens_gen_ms,
    )?;
    // the cache fact: what the provider served from its prefix cache —
    // the direct signal of the prompt cache health; the provider that
    // does not report it keeps the fields empty
    if let Some(stats) = &stats {
        log::info!(
            "chat cache [chat {chat_id}]: input {:?} (cached {:?}), output {:?}",
            stats.input_tokens,
            stats.cached_tokens,
            stats.output_tokens,
        );
    }
    Ok(())
}

/// Cancels the running stream of the chat's model, if any. The
/// stream task finalizes its row as `Cancelled` and its command
/// returns the fresh state — the plates arrive with it.
pub fn chat_cancel_send(store: &Store, chat_id: i32) -> Result<()> {
    let chat = studio_states::get_chat(store, chat_id)?;
    let group = studio_states::get_group_chat(store, chat.group_chat_id)?;
    let model = studio_states::get_provider_model(store, group.model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    utils::cancel_stream_token(&(provider.provider, model.name));
    Ok(())
}

/// Translates the model answer with the translation task model. A
/// stored translation never calls the model again — the column is
/// the cache, the task is requested once. With the streaming output
/// on, the whole balanced text goes to `on_delta` as it grows; off —
/// the translation arrives at once. Only a successful run writes:
/// the final write lands the text with its counted tokens, a
/// cancelled or failed run leaves the column alone.
pub async fn chat_translate_message(
    store: &Store,
    chat_id: i32,
    message_id: i32,
    on_delta: impl Fn(&str) + Send + Sync + 'static,
) -> Result<()> {
    studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    let message = histories
        .iter()
        .find(|message| message.id == Some(message_id))
        .ok_or_else(|| anyhow::anyhow!("Unknown message."))?;
    if message.message_type != ChatMessageType::Assistant {
        anyhow::bail!("Only a model answer can be translated.");
    }
    // the cache: an existing translation never calls the model again
    if message.translate.is_some() {
        return Ok(());
    }
    let settings = studio_states::get_settings(store).unwrap_or_default();
    let target = translate_target(store, settings.translation_answers.as_deref())?;

    // a fresh translation of the message gives way: the dying run
    // writes nothing
    utils::cancel_translate_token(message_id);
    let cancel = utils::stream_token();
    utils::translate_tokens()
        .lock()
        .expect("translate tokens poisoned")
        .insert(message_id, cancel.clone());

    if !settings.chat_streaming.unwrap_or(true) {
        let (text, stats) = studio_cluster::call_translate(
            target.kind,
            &target.host,
            target.api_key.as_deref(),
            target.project.as_deref(),
            &target.model,
            studio_cluster::CallParamsData::from(defaults::models::resolve(target.kind, &target.model)),
            &target.language,
            &message.text,
        )
        .await?;
        return finish_translation(store, message_id, &cancel, &text, &stats);
    }

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below paints them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEvent>();
    let call = std::pin::pin!(studio_cluster::call_translate_stream(
        target.kind,
        &target.host,
        target.api_key.as_deref(),
        target.project.as_deref(),
        &target.model,
        studio_cluster::CallParamsData::from(defaults::models::resolve(target.kind, &target.model)),
        &target.language,
        &message.text,
        cancel.as_ref(),
        {
            let tx = tx.clone();
            move |delta| {
                let _ = tx.send(StreamEvent::Text(delta.to_string()));
            }
        },
    ));

    let mut text_acc = String::new();
    let mut gate = stream::StreamGate::default();
    // one delta: grow the accumulator, snapshot to the shell
    let handle = |event: StreamEvent| -> Result<()> {
        if let StreamEvent::Text(chunk) = &event {
            text_acc.push_str(chunk);
            // the shell paints the balanced whole — the final write is the authority
            if gate.pass(text_acc.len()) {
                let snapshot = utils::close_open_fence(&text_acc).unwrap_or_else(|| text_acc.clone());
                on_delta(&snapshot);
            }
        }
        Ok(())
    };
    // only the final write lands: a cancelled or failed run writes nothing
    let (text, stats) = stream::pump(call, &mut rx, handle).await??;
    finish_translation(store, message_id, &cancel, &text, &stats)
}

/// The final write of a translation: only the run that still owns the
/// message token writes — a cancelled or replaced run leaves the
/// column alone. The owner's token leaves the registry.
fn finish_translation(
    store: &Store,
    message_id: i32,
    token: &Arc<CancelToken>,
    text: &str,
    stats: &studio_cluster::StreamStatsData,
) -> Result<()> {
    let mut tokens = utils::translate_tokens().lock().expect("translate tokens poisoned");
    let owned = tokens
        .get(&message_id)
        .is_some_and(|current| Arc::ptr_eq(current, token));
    if owned {
        tokens.remove(&message_id);
    }
    drop(tokens);
    if owned {
        studio_states::update_chat_history_translate(
            store,
            message_id,
            text,
            stats.output_tokens.map(|value| value as i32),
        )?;
    }
    Ok(())
}

/// Persists the show type of the message bubble. Switching away from
/// the translate or summary view cancels its generation — the dying
/// run loses ownership and writes nothing. The UI is not trusted:
/// the chat must exist and the message must belong to it.
pub fn chat_set_message_show_type(store: &Store, chat_id: i32, message_id: i32, show_type: ChatShowType) -> Result<()> {
    studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    if !histories.iter().any(|message| message.id == Some(message_id)) {
        anyhow::bail!("Unknown message.");
    }
    // the view being left gives way: its run writes nothing
    if show_type != ChatShowType::Translate {
        utils::drop_translate_token(message_id);
    }
    if show_type != ChatShowType::Summary {
        utils::drop_summary_token(message_id);
    }
    studio_states::update_chat_history_show_type(store, message_id, show_type)?;
    Ok(())
}

/// Persists the collapsed view flag of the message bubble. Collapsing
/// switches the bubble back to the text view — the artifact switches
/// live on the expanded body, and the running artifact runs give way.
/// The UI is not trusted: the chat must exist and the message must
/// belong to it.
pub fn chat_set_message_collapsed(store: &Store, chat_id: i32, message_id: i32, collapsed: bool) -> Result<()> {
    studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    if !histories.iter().any(|message| message.id == Some(message_id)) {
        anyhow::bail!("Unknown message.");
    }
    if collapsed {
        utils::drop_translate_token(message_id);
        utils::drop_summary_token(message_id);
        studio_states::update_chat_history_show_type(store, message_id, ChatShowType::Text)?;
    }
    studio_states::update_chat_history_collapsed(store, message_id, collapsed)?;
    Ok(())
}

/// Generates the brief summary of the model answer with the light
/// task model. The language follows the text itself; a cached
/// summary skips the call, the fresh one is written into the row.
/// The run carries its own cancel token — a deleted message gives
/// way; the registry entry leaves with the run, whatever the outcome.
pub async fn chat_summarize_message(store: &Store, chat_id: i32, message_id: i32) -> Result<()> {
    studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    let message = histories
        .iter()
        .find(|message| message.id == Some(message_id))
        .ok_or_else(|| anyhow::anyhow!("Unknown message."))?;
    // the cache: an existing summary never calls the model again
    if message.summary.is_some() {
        return Ok(());
    }
    let settings = studio_states::get_settings(store).unwrap_or_default();
    let Some(model_id) = settings.tasks_model_light else {
        anyhow::bail!("Task model is not set.");
    };
    let model = studio_states::get_provider_model(store, model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    utils::cancel_summary_token(message_id);
    let cancel = utils::stream_token();
    utils::summary_tokens()
        .lock()
        .expect("summary tokens poisoned")
        .insert(message_id, cancel.clone());

    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let result = studio_cluster::call_summary(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        studio_cluster::CallParamsData::from(defaults::models::resolve(kind, &model.name)),
        &message.text,
    )
    .await;

    // the registry entry leaves with the run, whatever the outcome
    utils::summary_tokens()
        .lock()
        .expect("summary tokens poisoned")
        .remove(&message_id);

    let (summary, stats) = result?;
    if summary.is_empty() {
        anyhow::bail!("Summary must not be blank.");
    }
    studio_states::update_chat_history_summary(
        store,
        message_id,
        &summary,
        stats.output_tokens.map(|value| value as i32),
    )?;
    Ok(())
}

/// Compresses the chat history into one context-base message: the
/// chat's model by default, the heavy task model by the flag — the
/// task config is the compression's own either way. The attempt is
/// born with the stream and grows in the store as the deltas arrive
/// — the UI hides the history and shows the progress. On success the
/// history is deleted and the base stays; on a cancel or a failure
/// the attempt is deleted and the history returns untouched. The UI
/// is not trusted: the chat must exist, the flag without the heavy
/// model is an error.
pub async fn chat_compress_message(
    store: &Store,
    chat_id: i32,
    use_task_model: bool,
    on_event: impl Fn(ChatStreamEvent) + Send + Sync + 'static,
) -> Result<()> {
    let chat = studio_states::get_chat(store, chat_id)?;
    let settings = studio_states::get_settings(store).unwrap_or_default();
    // the chat's model pair: the default target and the cancel key —
    // the composer Stop cuts the compression whatever model runs it
    let group = studio_states::get_group_chat(store, chat.group_chat_id)?;
    let chat_model = studio_states::get_provider_model(store, group.model_id)?;
    let chat_provider = studio_states::get_provider(store, chat_model.provider_id)?;
    let (provider, model_name) = if use_task_model {
        let Some(model_id) = settings.tasks_model_heavy else {
            anyhow::bail!("Task model is not set.");
        };
        let model = studio_states::get_provider_model(store, model_id)?;
        (studio_states::get_provider(store, model.provider_id)?, model.name)
    } else {
        (chat_provider.clone(), chat_model.name.clone())
    };
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;

    // a running stream of the chat's model gives way: on success its
    // answer row goes with the history — whatever model compresses
    utils::cancel_stream_token(&(chat_provider.provider.clone(), chat_model.name.clone()));

    // the model context: everything said so far, in order — only
    // complete messages count; the compress base goes as the user
    // turn it is, the assistant answers keep their role
    // the attachments are rebuilt from the stored bytes: the base
    // keeps the file texts, the images go as named placeholders —
    // the prompt history carries text only
    let mut history: Vec<(String, String, Vec<String>)> = Vec::new();
    for message in studio_states::get_chat_histories(store, chat_id)?
        .iter()
        .filter(|message| message.status == ChatStatus::Complete)
    {
        history.push((
            utils::history_role(message),
            attachment::render_message(store, message)?,
            Vec::new(),
        ));
    }
    if history.is_empty() {
        anyhow::bail!("Chat has no messages.");
    }

    // the attempt is born with the stream and grows in the store
    let attempt = studio_states::add_chat_history(
        store,
        chat_id,
        ChatMessageType::Compress,
        None,
        None,
        ChatStatus::Progress,
        "",
        None,
    )?;
    let attempt_id = attempt.id.expect("stored attempt id");

    // the token registers under the chat's model pair: the composer
    // Stop (chat_cancel_send) cuts the compression
    let cancel = utils::stream_token();
    utils::stream_tokens().lock().expect("stream tokens poisoned").insert(
        (chat_provider.provider.clone(), chat_model.name.clone()),
        cancel.clone(),
    );

    on_event(ChatStreamEvent::UserStored {
        chat: Some(chat.clone()),
        history: studio_states::get_chat_histories(store, chat_id).unwrap_or_default(),
    });

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below persists them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEvent>();
    let call = std::pin::pin!(studio_cluster::call_compress(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model_name,
        studio_cluster::CallParamsData::from(defaults::models::resolve(kind, &model_name)),
        history,
        cancel.as_ref(),
        {
            let tx = tx.clone();
            move |event| {
                let _ = tx.send(event.clone());
            }
        },
    ));

    let mut text_acc = String::new();
    let mut thinking_acc = String::new();
    // the growing row persists at most once per 300 ms — token
    // streams must not turn into hundreds of UPDATEs per second
    const PERSIST_INTERVAL_MS: u64 = 300;
    let mut persisted_at = std::time::Instant::now();
    // one gate for the whole answer: the phases never mix, and a
    // shared gate can only delay a snapshot, never drop one
    let mut gate = stream::StreamGate::default();
    // one delta: grow the accumulators, persist the row, snapshot to the shell
    let handle = |event: StreamEvent| -> Result<()> {
        match &event {
            StreamEvent::Text(chunk) => {
                text_acc.push_str(chunk);
                // the shell paints the balanced whole — the final
                // write is the authority
                if gate.pass(text_acc.len()) {
                    let snapshot = utils::close_open_fence(&text_acc).unwrap_or_else(|| text_acc.clone());
                    on_event(ChatStreamEvent::TextSnapshot(snapshot));
                }
            }
            StreamEvent::Thinking(chunk) => {
                thinking_acc.push_str(chunk);
                // thinking rides the same snapshot rule: the shell
                // replaces its copy, never accumulates
                if gate.pass(thinking_acc.len()) {
                    on_event(ChatStreamEvent::Thinking(thinking_acc.clone()));
                }
            }
        }
        let thinking = if thinking_acc.is_empty() {
            None
        } else {
            Some(thinking_acc.as_str())
        };
        if persisted_at.elapsed() >= std::time::Duration::from_millis(PERSIST_INTERVAL_MS) {
            persisted_at = std::time::Instant::now();
            // the interim write lands no tokens or timings
            studio_states::update_chat_history(
                store,
                attempt_id,
                &text_acc,
                thinking,
                ChatStatus::Progress,
                None,
                None,
                None,
                None,
                None,
            )?;
        }
        Ok(())
    };
    let outcome = stream::pump(call, &mut rx, handle).await?;

    // the outcome: the history stays untouched until a verified final
    // — a cancel, a failure or a cut stream deletes the attempt and
    // returns the history
    match outcome {
        // the success gate: the cluster reports a cut request by the
        // missing completion tokens — a partial text never passes
        Ok(result) if !result.cancelled && result.stats.is_some() => {
            let base = result.text.trim().to_string();
            if base.is_empty() {
                studio_states::delete_chat_history(store, attempt_id)?;
                anyhow::bail!("Compress must not be blank.");
            }
            // the swap: the base lands first — the history is deleted
            // only after the successful final is on disk
            let base = studio_states::add_chat_history_compress(
                store,
                chat_id,
                &base,
                result.thinking.as_deref(),
                result
                    .stats
                    .as_ref()
                    .and_then(|stats| stats.output_tokens)
                    .map(|value| value as i32),
            )?;
            studio_states::delete_chat_histories_except(store, chat_id, base.id.expect("stored base id"))?;
        }
        Ok(result) => {
            studio_states::delete_chat_history(store, attempt_id)?;
            // a cut stream arrives as a formally Ok answer without tokens
            if !result.cancelled {
                anyhow::bail!("Compression failed.");
            }
        }
        // the failed run keeps no base: the error rides the command
        Err(error) => {
            studio_states::delete_chat_history(store, attempt_id)?;
            return Err(error);
        }
    }
    Ok(())
}

// ─────────────────────────────────────────────
// Group Chat History
// ─────────────────────────────────────────────

/// All group chat history rows; a store error yields an empty list —
/// loading never blocks the UI.
pub fn get_group_chat_histories(store: &Store) -> Vec<GroupChatHistoryData> {
    studio_states::get_group_chat_histories(store).unwrap_or_default()
}

/// Persists the view flags of the group block and its chat list. The
/// UI is not trusted: the group must exist.
pub fn set_group_chat_view(
    store: &Store,
    group_chat_id: i32,
    collapsed_group: bool,
    collapsed_chats: bool,
) -> Result<()> {
    if studio_states::get_group_chat(store, group_chat_id).is_err() {
        anyhow::bail!("Unknown group.");
    }
    studio_states::set_group_chat_view(store, group_chat_id, collapsed_group, collapsed_chats)
}

/// Selects the group or its chat as the single active one. The UI is
/// not trusted: the group must exist, the chat must exist and belong
/// to the group. A group without a chat selection takes its newest
/// chat; a chatless group takes none. Counts the activation.
pub fn select_group_chat(store: &Store, group_chat_id: i32, chat_id: Option<i32>) -> Result<()> {
    studio_states::get_group_chat(store, group_chat_id)?;
    let chat_id = match chat_id {
        Some(chat_id) => {
            if studio_states::get_chat(store, chat_id)?.group_chat_id != group_chat_id {
                anyhow::bail!("Unknown chat.");
            }
            Some(chat_id)
        }
        None => studio_states::get_last_group_chat(store, group_chat_id)?.map(|chat| chat.id.expect("stored chat id")),
    };
    studio_states::set_active_group_chat(store, group_chat_id, chat_id)?;
    studio_states::bump_group_chat_history_activations(store, group_chat_id)
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

/// Opens (or creates) the studio database in the given app data directory.
pub fn store_open(dir: &Path) -> Result<Store> {
    Store::open(&dir.join("vibe-studio.db"))
}

/// The startup order of the app: a killed process leaves `Progress`
/// rows behind, and no stream can be alive on a fresh start — they
/// all read as cancelled, the partial texts stay.
pub fn init(store: &Store) -> Result<()> {
    studio_states::cancel_progress_chat_histories(store)?;
    // a dead compress attempt must not stay in the history
    studio_states::delete_progress_chat_histories_compress(store)?;
    Ok(())
}

/// Detects the OS theme once — the startup value; changes come
/// through the watcher.
pub fn get_system_theme() -> ThemeChoice {
    theme::system_theme()
}

/// Calls the callback with the OS theme on every change. Spawns a
/// background watcher thread that lives for the app's lifetime.
pub fn listen_system_theme(on_change: impl Fn(ThemeChoice) + Send + 'static) -> Result<()> {
    theme::listen_system_theme(on_change)
}

/// Sets the clipboard to plain text.
pub fn clipboard_write_text(text: &str) -> Result<()> {
    clipboard::write_text(text)
}

/// Decodes base64 PNG and sets the clipboard image.
pub fn clipboard_write_image(png: &str) -> Result<()> {
    clipboard::write_image(png)
}

/// Sets the clipboard to the file references.
pub fn clipboard_write_files(paths: &[PathBuf]) -> Result<()> {
    clipboard::write_files(paths)
}

/// Clears the system clipboard.
pub fn clipboard_clear() -> Result<()> {
    clipboard::clear()
}

/// The clipboard content by priority: text → files → image; `None`
/// when the clipboard is empty or unsupported.
pub fn clipboard_read() -> Option<ClipboardRead> {
    clipboard::read_all()
}

/// Opens the link in the default browser; only `http` and `https`
/// pass.
pub fn open_in_browser(url: &str) -> Result<()> {
    browser::open_in_browser(url)
}

/// The draft facts of a dropped path: the directory flag, the image
/// MIME sniffed from the header, the byte size.
pub fn attachment_stat(path: &str) -> AttachmentStatData {
    attachment::stat(path)
}
