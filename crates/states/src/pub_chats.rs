// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chats, their messages and attachments, published as the flat API.

//! The chats, their growing message history and the attachments:
//! the flat API over the `chats`, `chat_history` and
//! `chat_attachments` tables.

use anyhow::Result;

use crate::data::chat_attachments::ChatAttachmentBlob;
use crate::data::chat_attachments::ChatAttachmentNewData;
use crate::data::chat_history::ChatHistoryData;
use crate::data::chat_history::ChatMessageType;
use crate::data::chat_history::ChatShowType;
use crate::data::chat_history::ChatStatus;
use crate::data::chats::ChatData;
use crate::db::store::Store;

/// All chats.
pub fn get_chats(store: &Store) -> Result<Vec<ChatData>> {
    store.get_chats()
}

/// Loads one chat by id.
pub fn get_chat(store: &Store, id: i32) -> Result<ChatData> {
    store.get_chat(id)
}

/// The latest chat of the group; `None` = the group has no chats.
pub fn get_last_group_chat(store: &Store, group_chat_id: i32) -> Result<Option<ChatData>> {
    store.get_last_group_chat(group_chat_id)
}

/// Inserts a new chat (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_chat(store: &Store, chat: &ChatData) -> Result<ChatData> {
    store.save_chat(chat)
}

/// Deletes the chat with the given id, returns affected rows.
pub fn delete_chat(store: &Store, id: i32) -> Result<usize> {
    store.delete_chat(id)
}

/// Deletes all chats of the group, returns affected rows — the
/// cleanup behind the group deletion.
pub fn delete_group_chats(store: &Store, group_chat_id: i32) -> Result<usize> {
    store.delete_group_chats(group_chat_id)
}

/// All messages of the chat, oldest first.
pub fn get_chat_histories(store: &Store, chat_id: i32) -> Result<Vec<ChatHistoryData>> {
    store.get_chat_histories(chat_id)
}

/// Appends a message to the chat history; returns the stored row. A
/// model answer is born with `ChatStatus::Progress`; token facts
/// land only with the final update.
pub fn add_chat_history(
    store: &Store,
    chat_id: i32,
    message_type: ChatMessageType,
    provider: Option<&str>,
    model: Option<&str>,
    status: ChatStatus,
    text: &str,
    thinking: Option<&str>,
) -> Result<ChatHistoryData> {
    store.add_chat_history(chat_id, message_type, provider, model, status, text, thinking)
}

/// Inserts the compressed base the session continues from; the
/// message is born final with its reasoning and the provider token
/// facts of the compress call.
pub fn add_chat_history_compress(
    store: &Store,
    chat_id: i32,
    text: &str,
    thinking: Option<&str>,
    tokens_compress: Option<i32>,
) -> Result<ChatHistoryData> {
    store.add_chat_history_compress(chat_id, text, thinking, tokens_compress)
}

/// Appends a user message with its attachments; both inserts run in
/// one transaction — a failure leaves no half-sent message.
pub fn add_chat_message_attachments(
    store: &Store,
    chat_id: i32,
    text: &str,
    attachments: &[ChatAttachmentNewData],
) -> Result<ChatHistoryData> {
    store.add_chat_message_attachments(chat_id, text, attachments)
}

/// The stored bytes of one message's attachments — the source for
/// rebuilding the prompt of a resend or a compression.
pub fn get_chat_attachment_blobs(store: &Store, message_id: i32) -> Result<Vec<ChatAttachmentBlob>> {
    store.get_chat_attachment_blobs(message_id)
}

/// The final write of a finished run: the stream text/thinking, the
/// outcome status and the provider-reported token facts — `None`
/// stays `NULL`, nothing is invented. Returns affected rows.
pub fn update_chat_history(
    store: &Store,
    id: i32,
    text: &str,
    thinking: Option<&str>,
    status: ChatStatus,
    tokens_output: Option<i32>,
    tokens_thinking: Option<i32>,
    tokens_input: Option<i32>,
    tokens_cached: Option<i32>,
    tokens_gen_ms: Option<i32>,
) -> Result<usize> {
    store.update_chat_history(
        id,
        text,
        thinking,
        status,
        tokens_output,
        tokens_thinking,
        tokens_input,
        tokens_cached,
        tokens_gen_ms,
    )
}

/// Writes the message translation with the provider-reported tokens;
/// `None` stays `NULL` — the final write of a finished run.
pub fn update_chat_history_translate(
    store: &Store,
    id: i32,
    translate: &str,
    tokens_translate: Option<i32>,
) -> Result<usize> {
    store.update_chat_history_translate(id, translate, tokens_translate)
}

/// Persists the show type of the message bubble. Returns affected rows.
pub fn update_chat_history_show_type(store: &Store, id: i32, show_type: ChatShowType) -> Result<usize> {
    store.update_chat_history_show_type(id, show_type)
}

/// Persists the collapsed view flag of the message bubble. Returns affected rows.
pub fn update_chat_history_collapsed(store: &Store, id: i32, collapsed: bool) -> Result<usize> {
    store.update_chat_history_collapsed(id, collapsed)
}

/// Writes the message summary with the provider-reported tokens;
/// `None` stays `NULL` — the final write of a finished run.
pub fn update_chat_history_summary(
    store: &Store,
    id: i32,
    summary: &str,
    tokens_summary: Option<i32>,
) -> Result<usize> {
    store.update_chat_history_summary(id, summary, tokens_summary)
}

/// Active streams of one provider+model pair, oldest first.
pub fn get_progress_chat_histories(store: &Store, provider: &str, model: &str) -> Result<Vec<ChatHistoryData>> {
    store.get_progress_chat_histories(provider, model)
}

/// Cancels every progress row of the whole table — the startup sweep
/// behind a killed process. Returns affected rows.
pub fn cancel_progress_chat_histories(store: &Store) -> Result<usize> {
    store.cancel_progress_chat_histories()
}

/// Deletes the progress compress attempts of the whole table — the
/// startup sweep behind a killed process: a dead attempt must not
/// stay in the history. Returns affected rows.
pub fn delete_progress_chat_histories_compress(store: &Store) -> Result<usize> {
    store.delete_progress_chat_histories_compress()
}

/// Deletes the message with the given id, returns affected rows.
pub fn delete_chat_history(store: &Store, id: i32) -> Result<usize> {
    store.delete_chat_history(id)
}

/// Deletes all messages of the chat, returns affected rows — the
/// cleanup behind the chat deletion.
pub fn delete_chat_histories(store: &Store, chat_id: i32) -> Result<usize> {
    store.delete_chat_histories(chat_id)
}

/// Deletes the message with everything below it, returns affected rows.
pub fn delete_chat_histories_from(store: &Store, chat_id: i32, id: i32) -> Result<usize> {
    store.delete_chat_histories_from(chat_id, id)
}

/// Deletes everything below the message, the message stays; returns affected rows.
pub fn delete_chat_histories_after(store: &Store, chat_id: i32, id: i32) -> Result<usize> {
    store.delete_chat_histories_after(chat_id, id)
}

/// Deletes every message of the chat except the given one; the swap
/// behind the compression: the fresh base stays, the old history and
/// the attempt go. Returns affected rows.
pub fn delete_chat_histories_except(store: &Store, chat_id: i32, id: i32) -> Result<usize> {
    store.delete_chat_histories_except(chat_id, id)
}
