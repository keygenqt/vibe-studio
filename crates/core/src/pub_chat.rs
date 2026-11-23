// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat block: the chats, the message history and the running streams.

//! The chat block functions: the chat CRUD, the message history and
//! the stream orchestration — send, resend, translate, summary,
//! compress.

use std::sync::Arc;

use anyhow::Result;
use studio_cluster::CancelToken;
use studio_cluster::StreamEventData;
use studio_states::ChatData;
use studio_states::ChatHistoryData;
use studio_states::ChatMessageType;
use studio_states::ChatShowType;
use studio_states::ChatStatus;
use studio_states::Store;

use crate::ChatStreamEvent;
use crate::data::TranslateTargetData;
use crate::defaults::models;
use crate::services::attachment;
use crate::services::stream;
use crate::services::tokens;
use crate::utils;

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
    let name = studio_cluster::task_chat_name(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        studio_cluster::CallParamsData::from(models::resolve(kind, &model.name)),
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
    attachments: Vec<attachment::ChatAttachmentInput>,
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
        let (text, _) = studio_cluster::task_translate(
            target.kind,
            &target.host,
            target.api_key.as_deref(),
            target.project.as_deref(),
            &target.model,
            studio_cluster::CallParamsData::from(models::resolve(target.kind, &target.model)),
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
    tokens::cancel_stream_token(&(provider.provider, model.name));
    // the in-flight summary of the dying message gives way
    tokens::cancel_summary_token(message_id);
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
        tokens::cancel_stream_token(&key);
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

    let cancel = tokens::stream_token();
    tokens::stream_tokens()
        .lock()
        .expect("stream tokens poisoned")
        .insert(key.clone(), cancel.clone());

    on_event(ChatStreamEvent::UserStored {
        chat: Some(chat),
        history: studio_states::get_chat_histories(store, chat_id).unwrap_or_default(),
    });

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below persists them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEventData>();
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
    let handle = |event: StreamEventData| -> Result<()> {
        match &event {
            StreamEventData::Text(chunk) => {
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
            StreamEventData::Thinking(chunk) => {
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
    tokens::cancel_stream_token(&(provider.provider, model.name));
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
    tokens::cancel_translate_token(message_id);
    let cancel = tokens::stream_token();
    tokens::translate_tokens()
        .lock()
        .expect("translate tokens poisoned")
        .insert(message_id, cancel.clone());

    if !settings.chat_streaming.unwrap_or(true) {
        let (text, stats) = studio_cluster::task_translate(
            target.kind,
            &target.host,
            target.api_key.as_deref(),
            target.project.as_deref(),
            &target.model,
            studio_cluster::CallParamsData::from(models::resolve(target.kind, &target.model)),
            &target.language,
            &message.text,
        )
        .await?;
        return finish_translation(store, message_id, &cancel, &text, &stats);
    }

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below paints them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEventData>();
    let call = std::pin::pin!(studio_cluster::task_translate_stream(
        target.kind,
        &target.host,
        target.api_key.as_deref(),
        target.project.as_deref(),
        &target.model,
        studio_cluster::CallParamsData::from(models::resolve(target.kind, &target.model)),
        &target.language,
        &message.text,
        cancel.as_ref(),
        {
            let tx = tx.clone();
            move |delta| {
                let _ = tx.send(StreamEventData::Text(delta.to_string()));
            }
        },
    ));

    let mut text_acc = String::new();
    let mut gate = stream::StreamGate::default();
    // one delta: grow the accumulator, snapshot to the shell
    let handle = |event: StreamEventData| -> Result<()> {
        if let StreamEventData::Text(chunk) = &event {
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
    stats: &studio_cluster::StreamStatusData,
) -> Result<()> {
    let mut tokens = tokens::translate_tokens().lock().expect("translate tokens poisoned");
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
        tokens::drop_translate_token(message_id);
    }
    if show_type != ChatShowType::Summary {
        tokens::drop_summary_token(message_id);
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
        tokens::drop_translate_token(message_id);
        tokens::drop_summary_token(message_id);
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
    tokens::cancel_summary_token(message_id);
    let cancel = tokens::stream_token();
    tokens::summary_tokens()
        .lock()
        .expect("summary tokens poisoned")
        .insert(message_id, cancel.clone());

    let kind =
        studio_cluster::get_provider_by_kind(&provider.provider).ok_or_else(|| anyhow::anyhow!("Unknown provider."))?;
    let result = studio_cluster::task_summary(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model.name,
        studio_cluster::CallParamsData::from(models::resolve(kind, &model.name)),
        &message.text,
    )
    .await;

    // the registry entry leaves with the run, whatever the outcome
    tokens::summary_tokens()
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
    tokens::cancel_stream_token(&(chat_provider.provider.clone(), chat_model.name.clone()));

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
    let cancel = tokens::stream_token();
    tokens::stream_tokens().lock().expect("stream tokens poisoned").insert(
        (chat_provider.provider.clone(), chat_model.name.clone()),
        cancel.clone(),
    );

    on_event(ChatStreamEvent::UserStored {
        chat: Some(chat.clone()),
        history: studio_states::get_chat_histories(store, chat_id).unwrap_or_default(),
    });

    // the deltas ride a channel: the callback runs inside the cluster
    // call and cannot touch the store — the pump below persists them
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<StreamEventData>();
    let call = std::pin::pin!(studio_cluster::task_compress(
        kind,
        &provider.host,
        provider.api_key.as_deref(),
        provider.project.as_deref(),
        &model_name,
        studio_cluster::CallParamsData::from(models::resolve(kind, &model_name)),
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
    let handle = |event: StreamEventData| -> Result<()> {
        match &event {
            StreamEventData::Text(chunk) => {
                text_acc.push_str(chunk);
                // the shell paints the balanced whole — the final
                // write is the authority
                if gate.pass(text_acc.len()) {
                    let snapshot = utils::close_open_fence(&text_acc).unwrap_or_else(|| text_acc.clone());
                    on_event(ChatStreamEvent::TextSnapshot(snapshot));
                }
            }
            StreamEventData::Thinking(chunk) => {
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
