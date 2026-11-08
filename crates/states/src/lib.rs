// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Application state persistence on SQLite: the crate's public flat API.

//! Application state persistence on SQLite.
//!
//! Owns the database (schema, migrations) and the state structures
//! saved in it. The flat functions below are the crate's public API;
//! UI shells talk to this crate through `studio-core` only.

use anyhow::Result;

pub(crate) mod data;
pub(crate) mod db;

pub use data::attachment::ChatAttachmentBlob;
pub use data::attachment::ChatAttachmentData;
pub use data::attachment::ChatAttachmentNewData;
pub use data::chat::ChatData;
pub use data::chat_history::ChatHistoryData;
pub use data::chat_history::ChatMessageType;
pub use data::chat_history::ChatShowType;
pub use data::chat_history::ChatStatus;
pub use data::group_chat::GroupChatData;
pub use data::group_chat_history::GroupChatHistoryData;
pub use data::provider::ProviderData;
pub use data::provider_model::ProviderModelData;
pub use data::settings::SettingsData;
pub use data::workspace::WorkspaceData;
pub use db::store::Store;

/// All configured providers.
pub fn get_providers(store: &Store) -> Result<Vec<ProviderData>> {
    store.get_providers()
}

/// Loads one provider by id.
pub fn get_provider(store: &Store, id: i32) -> Result<ProviderData> {
    store.get_provider(id)
}

/// Inserts a new provider (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_provider(store: &Store, provider: &ProviderData) -> Result<ProviderData> {
    store.save_provider(provider)
}

/// Deletes the provider with the given id, returns affected rows.
pub fn delete_provider(store: &Store, id: i32) -> Result<usize> {
    store.delete_provider(id)
}

/// All models, optionally of one provider — `None` takes the whole
/// table behind the providers block state.
pub fn get_provider_models(store: &Store, provider_id: Option<i32>) -> Result<Vec<ProviderModelData>> {
    store.get_provider_models(provider_id)
}

/// Loads one model by id.
pub fn get_provider_model(store: &Store, id: i32) -> Result<ProviderModelData> {
    store.get_provider_model(id)
}

/// Inserts a new model (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_provider_model(store: &Store, model: &ProviderModelData) -> Result<ProviderModelData> {
    store.save_provider_model(model)
}

/// Persists the selection: upserts the given models with the stored config, prunes the rest; returns the fresh list.
pub fn save_provider_models(
    store: &Store,
    provider_id: i32,
    models: &[ProviderModelData],
) -> Result<Vec<ProviderModelData>> {
    store.save_provider_models(provider_id, models)
}

/// All chat groups.
pub fn get_groups_chat(store: &Store) -> Result<Vec<GroupChatData>> {
    store.get_groups_chat()
}

/// Loads one group by id.
pub fn get_group_chat(store: &Store, id: i32) -> Result<GroupChatData> {
    store.get_group_chat(id)
}

/// Inserts a new group (`id = None`) or updates the one with the given id; returns the stored row.
pub fn save_group_chat(store: &Store, group_chat: &GroupChatData) -> Result<GroupChatData> {
    store.save_group_chat(group_chat)
}

/// Deletes the group with the given id, returns affected rows.
pub fn delete_group_chat(store: &Store, id: i32) -> Result<usize> {
    store.delete_group_chat(id)
}

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
/// model answer is born with `ChatStatus::Progress`.
pub fn add_chat_history(
    store: &Store,
    chat_id: i32,
    message_type: ChatMessageType,
    provider: Option<&str>,
    model: Option<&str>,
    status: ChatStatus,
    text: &str,
    thinking: Option<&str>,
    tokens_answer: i32,
) -> Result<ChatHistoryData> {
    store.add_chat_history(
        chat_id,
        message_type,
        provider,
        model,
        status,
        text,
        thinking,
        tokens_answer,
    )
}

/// Inserts the compressed base the session continues from; the
/// message is born final with its reasoning and counted tokens.
pub fn add_chat_history_compress(
    store: &Store,
    chat_id: i32,
    text: &str,
    thinking: Option<&str>,
    tokens_compress: i32,
) -> Result<ChatHistoryData> {
    store.add_chat_history_compress(chat_id, text, thinking, tokens_compress)
}

/// Appends a user message with its attachments; both inserts run in
/// one transaction — a failure leaves no half-sent message.
pub fn add_chat_message_attachments(
    store: &Store,
    chat_id: i32,
    text: &str,
    tokens_answer: i32,
    attachments: &[ChatAttachmentNewData],
) -> Result<ChatHistoryData> {
    store.add_chat_message_attachments(chat_id, text, tokens_answer, attachments)
}

/// The stored bytes of one message's attachments — the source for
/// rebuilding the prompt of a resend or a compression.
pub fn get_chat_attachment_blobs(store: &Store, message_id: i32) -> Result<Vec<ChatAttachmentBlob>> {
    store.get_chat_attachment_blobs(message_id)
}

/// Updates a growing message in place: the stream text/thinking, the
/// counted answer and thinking tokens with the generation time, and
/// the outcome status. Returns affected rows.
pub fn update_chat_history(
    store: &Store,
    id: i32,
    text: &str,
    thinking: Option<&str>,
    status: ChatStatus,
    tokens_answer: i32,
    tokens_thinking: Option<i32>,
    tokens_user: Option<i32>,
    tokens_system: Option<i32>,
    tokens_history: Option<i32>,
    tokens_gen_ms: Option<i32>,
) -> Result<usize> {
    store.update_chat_history(
        id,
        text,
        thinking,
        status,
        tokens_answer,
        tokens_thinking,
        tokens_user,
        tokens_system,
        tokens_history,
        tokens_gen_ms,
    )
}

/// Writes the message translation with its counted tokens — the
/// final write of a finished run.
pub fn update_chat_history_translate(store: &Store, id: i32, translate: &str, tokens_translate: i32) -> Result<usize> {
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

/// Writes the message summary with its counted tokens — the final
/// write of a finished run.
pub fn update_chat_history_summary(store: &Store, id: i32, summary: &str, tokens_summary: i32) -> Result<usize> {
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

/// All group chat history rows.
pub fn get_group_chat_histories(store: &Store) -> Result<Vec<GroupChatHistoryData>> {
    store.get_group_chat_histories()
}

/// Borns the history row with the group and activates the fresh group.
pub fn create_group_chat_history(store: &Store, group_chat_id: i32) -> Result<GroupChatHistoryData> {
    store.create_group_chat_history(group_chat_id)
}

/// Selects the group (`chat_id = None`) or its chat as the single active one.
pub fn set_active_group_chat(store: &Store, group_chat_id: i32, chat_id: Option<i32>) -> Result<()> {
    store.set_active_group_chat(group_chat_id, chat_id)
}

/// Persists the view flags of the group block and its chat list.
pub fn set_group_chat_view(
    store: &Store,
    group_chat_id: i32,
    collapsed_group: bool,
    collapsed_chats: bool,
) -> Result<()> {
    store.set_group_chat_view(group_chat_id, collapsed_group, collapsed_chats)
}

/// Counts a group save — the update branch.
pub fn bump_group_chat_history_updates(store: &Store, group_chat_id: i32) -> Result<()> {
    store.bump_group_chat_history_updates(group_chat_id)
}

/// Counts a user selection of the group or its chat.
pub fn bump_group_chat_history_activations(store: &Store, group_chat_id: i32) -> Result<()> {
    store.bump_group_chat_history_activations(group_chat_id)
}

/// Counts a chat created in the group.
pub fn bump_group_chat_history_chats_created(store: &Store, group_chat_id: i32) -> Result<()> {
    store.bump_group_chat_history_chats_created(group_chat_id)
}

/// Clears the selected chat that points at the deleted chat; returns
/// 1 if the deleted chat was the selected one.
pub fn clear_group_chat_history_selected_chat(store: &Store, chat_id: i32) -> Result<usize> {
    store.clear_group_chat_history_selected_chat(chat_id)
}

/// Deletes the history row together with its group.
pub fn delete_group_chat_history(store: &Store, group_chat_id: i32) -> Result<usize> {
    store.delete_group_chat_history(group_chat_id)
}

/// Loads the shell environment; a missing row falls back to `Default`.
pub fn get_workspace(store: &Store) -> Result<WorkspaceData> {
    store.get_workspace()
}

/// Persists the shell environment as the single row, returns it.
pub fn save_workspace(store: &Store, workspace: &WorkspaceData) -> Result<WorkspaceData> {
    store.save_workspace(workspace)
}

/// Loads the user preferences; a missing row falls back to `Default`.
pub fn get_settings(store: &Store) -> Result<SettingsData> {
    store.get_settings()
}

/// Persists the user preferences as the single row, returns it.
pub fn save_settings(store: &Store, settings: &SettingsData) -> Result<SettingsData> {
    store.save_settings(settings)
}
