// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme', 'facts']
// INFO: Vibe Studio core: facade over sub-crates — the single API for UI shells.

//! Vibe Studio core — facade over sub-crates. UI shells talk to this
//! crate only.

use anyhow::Result;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use studio_cluster::CancelToken;

pub use studio_cluster::StreamEvent;

mod clipboard;
mod data;
pub(crate) mod theme;
mod utils;

pub use data::ChatStreamEvent;
pub use data::ClipboardRead;
pub use studio_cluster::ModelInfoData;
pub use studio_cluster::ProviderInfoData;
pub use studio_states::ChatData;
pub use studio_states::ChatHistoryData;
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
/// trusted: a set model id must exist; theme, locale and accent are
/// stored as sent.
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

/// Validates and persists the model; the UI is not trusted: the id
/// must exist, whitespace-only texts and out-of-range config values
/// are errors; everything else is stored as sent.
pub fn save_provider_model(store: &Store, model: &ProviderModelData) -> Result<ProviderModelData> {
    let Some(id) = model.id else {
        anyhow::bail!("Model id is required.");
    };
    if studio_states::get_provider_model(store, id).is_err() {
        anyhow::bail!("Unknown model.");
    }
    if model
        .display_name
        .as_deref()
        .is_some_and(|text| !text.is_empty() && text.trim().is_empty())
    {
        anyhow::bail!("Display name must not be blank.");
    }
    if model
        .system_prompt
        .as_deref()
        .is_some_and(|text| !text.is_empty() && text.trim().is_empty())
    {
        anyhow::bail!("System prompt must not be blank.");
    }
    if model.temperature.is_some_and(|value| !(0.0..=2.0).contains(&value)) {
        anyhow::bail!("Temperature must be between 0 and 2.");
    }
    if model.seed.is_some_and(|value| value < 0) {
        anyhow::bail!("Seed must not be negative.");
    }
    if model.num_ctx.is_some_and(|value| value < 1) {
        anyhow::bail!("Context must not be empty.");
    }
    if model.num_predict.is_some_and(|value| value < 1) {
        anyhow::bail!("Predict limit must not be empty.");
    }
    studio_states::save_provider_model(store, model)
}

/// Persists the selection of one provider's model catalog: fetches
/// the live list from the host and upserts the selected models with
/// fresh facts; models outside the selection are removed. The UI
/// sends only the provider id and the selected names. A fetch error
/// aborts before any mutation — a failed sync never touches the
/// table. An empty selection is valid.
pub async fn save_provider_models(
    store: &Store,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<ProviderModelData>> {
    let provider = studio_states::get_provider(store, provider_id)?;
    let models = crate::get_provider_models_by_type(
        &provider.provider,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
    )
    .await?;
    let rows: Vec<ProviderModelData> = models
        .into_iter()
        .filter(|model| checked.iter().any(|name| *name == model.name))
        .map(|model| ProviderModelData {
            provider_id,
            name: model.name,
            params: model.params,
            vision: model.vision,
            tools: model.tools,
            reasoning: model.thinking,
            ..Default::default()
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
/// model names the chat by its last two messages. The UI is not
/// trusted: the chat must exist, the light model must be set, the
/// chat must have messages; a blank answer is an error.
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
    let start = messages.len().saturating_sub(2);
    let history = messages[start..]
        .iter()
        .map(|message| (utils::history_role(message), message.text.clone()))
        .collect();
    let language = utils::locale_language(&settings.appearance_locale);
    let name = studio_cluster::call_chat_name(
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        history,
        language,
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

/// Sends the user's message to the chat's model and records both
/// sides of the exchange. The UI is not trusted: the chat must exist,
/// a blank message is an error. The model prompt comes first, the
/// group prompt completes it; empty prompts drop out. The answer is
/// born as a `Progress` row and grows in the store as the deltas
/// arrive; a failed request is finalized as an `Error` message, a
/// cancelled one — as `Cancelled` with the partial text.
pub async fn chat_send_message(
    store: &Store,
    chat_id: i32,
    text: &str,
    on_event: impl Fn(ChatStreamEvent) + Send + Sync + 'static,
) -> Result<()> {
    if text.trim().is_empty() {
        anyhow::bail!("Message must not be blank.");
    }
    studio_states::get_chat(store, chat_id)?;
    let user = studio_states::add_chat_history(
        store,
        chat_id,
        None,
        None,
        ChatStatus::Complete,
        text,
        None,
        studio_cluster::count_tokens(text) as i32,
    )?;
    chat_send_stream(store, chat_id, text, user.id.expect("stored user id"), on_event).await
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
    if message.model.is_some() {
        anyhow::bail!("Only a user message can be resent.");
    }
    studio_states::delete_chat_histories_after(store, chat_id, message_id)?;
    chat_send_stream(store, chat_id, &message.text, message_id, on_event).await
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
    skip_id: i32,
    on_event: impl Fn(ChatStreamEvent) + Send + Sync + 'static,
) -> Result<()> {
    let chat = studio_states::get_chat(store, chat_id)?;
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
        .map(|message| (utils::history_role(&message), message.text))
        .collect();

    let system = [model.system_prompt.as_deref(), group.system_prompt.as_deref()]
        .into_iter()
        .flatten()
        .map(str::trim)
        .filter(|prompt| !prompt.is_empty())
        .collect::<Vec<_>>()
        .join("\n\n");

    // the answer row is born with the stream and grows in the store
    let answer = studio_states::add_chat_history(
        store,
        chat_id,
        Some(provider.provider.as_str()),
        Some(model.name.as_str()),
        ChatStatus::Progress,
        "",
        None,
        0,
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
    let mut call = std::pin::pin!(studio_cluster::call_prompt_stream(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        model.temperature.unwrap_or(0.7),
        model.seed.unwrap_or(42),
        model.num_ctx.unwrap_or(4096),
        model.num_predict.unwrap_or(2048),
        if system.is_empty() { None } else { Some(system) },
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
    // the text generation window: from the first text delta to the
    // finalization — the thinking time stays out of the speed
    let mut gen_start: Option<std::time::Instant> = None;
    // one delta: grow the accumulators, persist the row, forward to the shell
    let mut handle = |event: StreamEvent| -> Result<()> {
        match &event {
            StreamEvent::Text(chunk) => {
                if gen_start.is_none() {
                    gen_start = Some(std::time::Instant::now());
                }
                text_acc.push_str(chunk);
            }
            StreamEvent::Thinking(chunk) => thinking_acc.push_str(chunk),
        }
        let thinking = if thinking_acc.is_empty() {
            None
        } else {
            Some(thinking_acc.as_str())
        };
        if persisted_at.elapsed() >= std::time::Duration::from_millis(PERSIST_INTERVAL_MS) {
            persisted_at = std::time::Instant::now();
            // tokens land only with the final write — the authority
            studio_states::update_chat_history(store, answer_id, &text_acc, thinking, ChatStatus::Progress, 0, None)?;
        }
        on_event(ChatStreamEvent::Delta(event));
        Ok(())
    };
    // a closed channel disables the rx arm: the senders are gone and
    // the call resolves on its own — the arm must not spin on None
    let mut rx_closed = false;
    let outcome = loop {
        tokio::select! {
            biased;
            delta = rx.recv(), if !rx_closed => match delta {
                Some(event) => handle(event)?,
                None => rx_closed = true,
            },
            done = &mut call => break done,
        }
    };
    // the deltas that arrived before the call future resolved
    while let Ok(event) = rx.try_recv() {
        handle(event)?;
    }

    // the final write is the only authority: full text, thinking, status
    let (final_text, final_thinking, status) = match outcome {
        Err(error) => (format!("{error}"), None, ChatStatus::Error),
        Ok(result) => (
            result.text,
            result.thinking,
            if result.cancelled {
                ChatStatus::Cancelled
            } else {
                ChatStatus::Complete
            },
        ),
    };
    let gen_ms = gen_start.map(|start| start.elapsed().as_millis() as i32);
    studio_states::update_chat_history(
        store,
        answer_id,
        &final_text,
        final_thinking.as_deref(),
        status,
        studio_cluster::count_tokens(&final_text) as i32,
        gen_ms,
    )?;
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

/// Translates the model answer with the translation task model. With
/// the streaming output on, the text deltas go to `on_delta` and the
/// growing translation persists in the row; off — the translation
/// arrives at once. Every translation replaces the stored one: the
/// column holds only the shown translation. A cancelled run writes
/// nothing — the closer clears the column, a replaced run belongs to
/// the newest translation; a failed run clears the partial text.
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
    if message.model.is_none() {
        anyhow::bail!("Only a model answer can be translated.");
    }
    let settings = studio_states::get_settings(store).unwrap_or_default();
    let Some(model_id) = settings.translation_model else {
        anyhow::bail!("Translation model is not set.");
    };
    let Some(locale) = settings.translation_answers.as_deref() else {
        anyhow::bail!("Translation language is not set.");
    };
    let model = studio_states::get_provider_model(store, model_id)?;
    let provider = studio_states::get_provider(store, model.provider_id)?;
    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let language = utils::locale_language(locale);

    // a fresh translation of the message gives way: the dying run
    // writes nothing — the column belongs to the newest translation
    utils::cancel_translate_token(message_id);
    let cancel = utils::stream_token();
    utils::translate_tokens()
        .lock()
        .expect("translate tokens poisoned")
        .insert(message_id, cancel.clone());

    // the task config is the function's own — the task never uses
    // the model's generation settings
    let prompt = format!(
        r#"
Translate the text to {language}. Answer with the translation only: keep the original formatting, no explanations.
"#
    )
    .trim()
    .to_string();

    if !settings.chat_streaming.unwrap_or(true) {
        let text = studio_cluster::call_prompt(
            kind,
            &provider.host,
            provider.api_key.as_deref(),
            provider.project.as_deref(),
            &model.name,
            0.7,
            42,
            4096,
            2048,
            Some(prompt),
            Vec::new(),
            &message.text,
        )
        .await?;
        return finish_translation(store, message_id, &cancel, Some(&text));
    }

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below persists them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEvent>();
    let mut call = std::pin::pin!(studio_cluster::call_prompt_stream(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        0.7,
        42,
        4096,
        2048,
        Some(prompt),
        Vec::new(),
        &message.text,
        cancel.as_ref(),
        {
            let tx = tx.clone();
            move |event| {
                // thinking stays out: the translation is text only
                if let StreamEvent::Text(_) = event {
                    let _ = tx.send(event.clone());
                }
            }
        },
    ));

    let mut text_acc = String::new();
    const PERSIST_INTERVAL_MS: u64 = 300;
    let mut persisted_at = std::time::Instant::now();
    // one delta: grow the accumulator, persist the row, forward to the shell
    let mut handle = |event: StreamEvent| -> Result<()> {
        if let StreamEvent::Text(chunk) = &event {
            text_acc.push_str(chunk);
            if persisted_at.elapsed() >= std::time::Duration::from_millis(PERSIST_INTERVAL_MS) {
                persisted_at = std::time::Instant::now();
                studio_states::update_chat_history_translate(store, message_id, Some(text_acc.as_str()))?;
            }
            on_delta(chunk);
        }
        Ok(())
    };
    // a closed channel disables the rx arm: the senders are gone and
    // the call resolves on its own — the arm must not spin on None
    let mut rx_closed = false;
    let outcome = loop {
        tokio::select! {
            biased;
            delta = rx.recv(), if !rx_closed => match delta {
                Some(event) => handle(event)?,
                None => rx_closed = true,
            },
            done = &mut call => break done,
        }
    };
    // the deltas that arrived before the call future resolved
    while let Ok(event) = rx.try_recv() {
        handle(event)?;
    }

    match outcome {
        Ok(result) => finish_translation(store, message_id, &cancel, Some(&result.text)),
        // a failed run clears the partial text, the error surfaces
        Err(error) => {
            finish_translation(store, message_id, &cancel, None)?;
            Err(error)
        }
    }
}

/// Clears the translation of the message — the close of the
/// translation view. The running translation of the message gives
/// way: it writes nothing, the column holds only the shown one.
pub fn chat_translate_clear(store: &Store, chat_id: i32, message_id: i32) -> Result<()> {
    studio_states::get_chat(store, chat_id)?;
    let histories = studio_states::get_chat_histories(store, chat_id)?;
    if !histories.iter().any(|message| message.id == Some(message_id)) {
        anyhow::bail!("Unknown message.");
    }
    utils::cancel_translate_token(message_id);
    utils::translate_tokens()
        .lock()
        .expect("translate tokens poisoned")
        .remove(&message_id);
    studio_states::update_chat_history_translate(store, message_id, None)?;
    Ok(())
}

/// The final write of a translation: only the run that still owns the
/// message token writes — a cancelled or replaced run leaves the
/// column alone. The owner's token leaves the registry.
fn finish_translation(store: &Store, message_id: i32, token: &Arc<CancelToken>, text: Option<&str>) -> Result<()> {
    let mut tokens = utils::translate_tokens().lock().expect("translate tokens poisoned");
    let owned = tokens
        .get(&message_id)
        .is_some_and(|current| Arc::ptr_eq(current, token));
    if owned {
        tokens.remove(&message_id);
    }
    drop(tokens);
    if owned {
        studio_states::update_chat_history_translate(store, message_id, text)?;
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
