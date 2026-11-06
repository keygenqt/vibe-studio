// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat_history table: chat messages with sender and status, growing in place.

use anyhow::Result;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde_with::TimestampMilliSeconds;
use serde_with::serde_as;

use std::collections::HashMap;

use super::attachment::ChatAttachmentData;
use super::attachment::ChatAttachmentNewData;
use crate::Store;

/// The outcome status of a message. Serialized lowercase; an unknown
/// stored value reads as `Error` — broken data must not pass for a
/// normal message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChatStatus {
    /// A user message, or a full answer of the model.
    Complete,
    /// The model stream is running: the text grows in the row.
    Progress,
    /// The stream was cut: by the user, or by a newer request to the same model.
    Cancelled,
    /// A failed request: the error text is kept as the message.
    Error,
}

impl ChatStatus {
    /// The string form stored in the `status` column.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Complete => "complete",
            Self::Progress => "progress",
            Self::Cancelled => "cancelled",
            Self::Error => "error",
        }
    }

    /// Parses the stored string; an unknown value falls back to `Error`.
    pub fn from_value(value: &str) -> Self {
        match value {
            "complete" => Self::Complete,
            "progress" => Self::Progress,
            "cancelled" => Self::Cancelled,
            _ => Self::Error,
        }
    }
}

/// The sender kind of a message. Serialized lowercase; an unknown
/// stored value reads as `User` — broken data must not pass for a
/// normal message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChatMessageType {
    /// A message of the user.
    User,
    /// An answer of the model.
    Assistant,
    /// The compressed context base the session continues from.
    Compress,
}

impl ChatMessageType {
    /// The string form stored in the `message_type` column.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::User => "user",
            Self::Assistant => "assistant",
            Self::Compress => "compress",
        }
    }

    /// Parses the stored string; an unknown value falls back to `User`.
    pub fn from_value(value: &str) -> Self {
        match value {
            "assistant" => Self::Assistant,
            "compress" => Self::Compress,
            _ => Self::User,
        }
    }
}

/// The message bubble view: which artifact the bubble shows.
/// Serialized lowercase; an unknown stored value reads as `Text` —
/// broken data must not pass for a normal bubble.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChatShowType {
    /// The message text itself.
    Text,
    /// The translation of the text.
    Translate,
    /// The brief summary of the text.
    Summary,
    /// The model reasoning behind the answer.
    Thinking,
}

impl ChatShowType {
    /// The string form stored in the `show_type` column.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Text => "text",
            Self::Translate => "translate",
            Self::Summary => "summary",
            Self::Thinking => "thinking",
        }
    }

    /// Parses the stored string; an unknown value falls back to `Text`.
    pub fn from_value(value: &str) -> Self {
        match value {
            "translate" => Self::Translate,
            "summary" => Self::Summary,
            "thinking" => Self::Thinking,
            _ => Self::Text,
        }
    }
}

/// A message of a chat. A user message carries no sender; a model
/// answer carries the provider kind and the model name it ran on.
/// `id` is `None` until the row is stored — SQLite owns the id.
#[serde_as]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ChatHistoryData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the chat the message belongs to.
    pub chat_id: i32,
    /// The sender kind of the message.
    pub message_type: ChatMessageType,
    /// Kind id of the answering provider ("ollama", ...); `None` = a user message.
    pub provider: Option<String>,
    /// Name of the answering model; `None` = a user message.
    pub model: Option<String>,
    /// What happened to the message.
    pub status: ChatStatus,
    /// Which artifact the bubble shows.
    pub show_type: ChatShowType,
    /// The message text; for `Error` — the error text.
    pub text: String,
    /// The model reasoning behind the answer.
    pub thinking: Option<String>,
    /// The translation of the text, generated once; `None` = not
    /// generated yet.
    pub translate: Option<String>,
    /// The brief summary of the text, generated by the light task
    /// model; `None` = not generated yet.
    pub summary: Option<String>,
    /// The file attachments of a user message; the metadata only —
    /// the bytes never leave the store.
    pub attachments: Vec<ChatAttachmentData>,
    /// Estimated tokens of the text; `None` = not counted.
    pub tokens_answer: Option<i32>,
    /// Estimated tokens of the reasoning; `None` = none or not counted.
    pub tokens_thinking: Option<i32>,
    /// Estimated tokens of the translation; `None` = not generated yet.
    pub tokens_translate: Option<i32>,
    /// Estimated tokens of the summary; `None` = not generated yet.
    pub tokens_summary: Option<i32>,
    /// Estimated tokens of the compressed base; `None` = not compressed.
    pub tokens_compress: Option<i32>,
    /// Duration of the answer text generation in milliseconds; `None`
    /// for user messages and failed answers.
    pub tokens_gen_ms: Option<i32>,
    /// Store-owned: when the row was born; JS gets unix millis.
    #[serde_as(as = "TimestampMilliSeconds<i64>")]
    pub created_at: NaiveDateTime,
    /// The collapsed view flag of the bubble; the height clamp is
    /// the shell's business.
    pub collapsed: bool,
}

diesel::table! {
    chat_history (id) {
        id -> Integer,
        chat_id -> Integer,
        message_type -> Text,
        provider -> Nullable<Text>,
        model -> Nullable<Text>,
        status -> Text,
        show_type -> Text,
        text -> Text,
        thinking -> Nullable<Text>,
        translate -> Nullable<Text>,
        summary -> Nullable<Text>,
        tokens_answer -> Nullable<Integer>,
        tokens_thinking -> Nullable<Integer>,
        tokens_translate -> Nullable<Integer>,
        tokens_summary -> Nullable<Integer>,
        tokens_compress -> Nullable<Integer>,
        tokens_gen_ms -> Nullable<Integer>,
        created_at -> Timestamp,
        collapsed -> Bool,
    }
}

/// The stored row as diesel reads it; mapped to `ChatHistoryData` on
/// the way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = chat_history)]
struct ChatHistoryRow {
    id: i32,
    chat_id: i32,
    message_type: String,
    provider: Option<String>,
    model: Option<String>,
    status: String,
    show_type: String,
    text: String,
    thinking: Option<String>,
    translate: Option<String>,
    summary: Option<String>,
    tokens_answer: Option<i32>,
    tokens_thinking: Option<i32>,
    tokens_translate: Option<i32>,
    tokens_summary: Option<i32>,
    tokens_compress: Option<i32>,
    tokens_gen_ms: Option<i32>,
    created_at: NaiveDateTime,
    collapsed: bool,
}

impl From<ChatHistoryRow> for ChatHistoryData {
    fn from(row: ChatHistoryRow) -> Self {
        ChatHistoryData {
            id: Some(row.id),
            chat_id: row.chat_id,
            message_type: ChatMessageType::from_value(&row.message_type),
            provider: row.provider,
            model: row.model,
            status: ChatStatus::from_value(&row.status),
            show_type: ChatShowType::from_value(&row.show_type),
            text: row.text,
            thinking: row.thinking,
            translate: row.translate,
            summary: row.summary,
            attachments: Vec::new(),
            tokens_answer: row.tokens_answer,
            tokens_thinking: row.tokens_thinking,
            tokens_translate: row.tokens_translate,
            tokens_summary: row.tokens_summary,
            tokens_compress: row.tokens_compress,
            tokens_gen_ms: row.tokens_gen_ms,
            created_at: row.created_at,
            collapsed: row.collapsed,
        }
    }
}

/// Insert values: the id and the timestamp are owned by SQLite.
/// `translate` is never written — the field waits for its feature.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = chat_history)]
struct ChatHistoryNewData {
    chat_id: i32,
    message_type: String,
    provider: Option<String>,
    model: Option<String>,
    status: String,
    text: String,
    thinking: Option<String>,
    tokens_answer: i32,
    // the compress token lands with the insert; `None` is skipped by
    // the changeset on the update path
    tokens_compress: Option<i32>,
    // the default view of the fresh bubble; the user changes it after
    collapsed: bool,
}

impl Store {
    /// All messages of the chat, in id order — oldest first.
    pub(crate) fn get_chat_histories(&self, chat_id: i32) -> Result<Vec<ChatHistoryData>> {
        let mut messages: Vec<ChatHistoryData> = {
            let mut conn = self.lock();
            let rows: Vec<ChatHistoryRow> = chat_history::table
                .filter(chat_history::chat_id.eq(chat_id))
                .order_by(chat_history::id.asc())
                .select(ChatHistoryRow::as_select())
                .load(&mut *conn)?;
            rows.into_iter().map(ChatHistoryData::from).collect()
        };
        // the metadata merges here; the bytes stay behind the blob access
        let ids: Vec<i32> = messages.iter().filter_map(|message| message.id).collect();
        let mut by_message: HashMap<i32, Vec<ChatAttachmentData>> = HashMap::new();
        for attachment in self.get_chat_attachments(&ids)? {
            by_message.entry(attachment.message_id).or_default().push(attachment);
        }
        for message in &mut messages {
            message.attachments = by_message
                .remove(&message.id.expect("stored message id"))
                .unwrap_or_default();
        }
        Ok(messages)
    }

    /// Appends a message; returns the stored row. A model answer is
    /// born with `ChatStatus::Progress` and grows in place until the
    /// final status.
    pub(crate) fn add_chat_history(
        &self,
        chat_id: i32,
        message_type: ChatMessageType,
        provider: Option<&str>,
        model: Option<&str>,
        status: ChatStatus,
        text: &str,
        thinking: Option<&str>,
        tokens_answer: i32,
    ) -> Result<ChatHistoryData> {
        let row: ChatHistoryRow = self.save(
            chat_history::table,
            None,
            ChatHistoryNewData {
                chat_id,
                message_type: message_type.as_str().to_string(),
                provider: provider.map(String::from),
                model: model.map(String::from),
                status: status.as_str().to_string(),
                text: text.to_string(),
                thinking: thinking.map(String::from),
                tokens_answer,
                tokens_compress: None,
                // the user prompt is born Complete — collapsed by default
                collapsed: message_type == ChatMessageType::User,
            },
        )?;
        Ok(ChatHistoryData::from(row))
    }

    /// Appends a user message with its attachments in one
    /// transaction: a failed insert leaves no half-sent message.
    pub(crate) fn add_chat_message_attachments(
        &self,
        chat_id: i32,
        text: &str,
        tokens_answer: i32,
        attachments: &[ChatAttachmentNewData],
    ) -> Result<ChatHistoryData> {
        let mut conn = self.lock();
        let row = conn.transaction::<ChatHistoryRow, anyhow::Error, _>(|conn| {
            diesel::insert_into(chat_history::table)
                .values(ChatHistoryNewData {
                    chat_id,
                    message_type: ChatMessageType::User.as_str().to_string(),
                    provider: None,
                    model: None,
                    status: ChatStatus::Complete.as_str().to_string(),
                    text: text.to_string(),
                    thinking: None,
                    tokens_answer,
                    tokens_compress: None,
                    // the user prompt is born Complete — collapsed by default
                    collapsed: true,
                })
                .execute(conn)?;
            // the readback mirrors `save`: insert, the rowid, the
            // row — no RETURNING, the sqlite backend skips it
            let saved_id: i32 = diesel::select(diesel::dsl::sql::<diesel::sql_types::Integer>("last_insert_rowid()"))
                .get_result(conn)?;
            Store::insert_chat_attachments(conn, saved_id, attachments)?;
            let row: ChatHistoryRow = chat_history::table.find(saved_id).first(conn)?;
            Ok(row)
        })?;
        Ok(ChatHistoryData::from(row))
    }

    /// Inserts the compressed base the session continues from; the
    /// message is born final with its reasoning and counted tokens.
    pub(crate) fn add_chat_history_compress(
        &self,
        chat_id: i32,
        text: &str,
        thinking: Option<&str>,
        tokens_compress: i32,
    ) -> Result<ChatHistoryData> {
        let row: ChatHistoryRow = self.save(
            chat_history::table,
            None,
            ChatHistoryNewData {
                chat_id,
                message_type: ChatMessageType::Compress.as_str().to_string(),
                provider: None,
                model: None,
                status: ChatStatus::Complete.as_str().to_string(),
                text: text.to_string(),
                thinking: thinking.map(String::from),
                tokens_answer: 0,
                tokens_compress: Some(tokens_compress),
                collapsed: false,
            },
        )?;
        Ok(ChatHistoryData::from(row))
    }

    /// Updates a growing message in place: the stream text/thinking,
    /// the counted answer and thinking tokens with the generation
    /// time, and the outcome status. Returns affected rows.
    pub(crate) fn update_chat_history(
        &self,
        id: i32,
        text: &str,
        thinking: Option<&str>,
        status: ChatStatus,
        tokens_answer: i32,
        tokens_thinking: Option<i32>,
        tokens_gen_ms: Option<i32>,
    ) -> Result<usize> {
        let affected = diesel::update(chat_history::table.find(id))
            .set((
                chat_history::text.eq(text.to_string()),
                chat_history::thinking.eq(thinking.map(String::from)),
                chat_history::status.eq(status.as_str().to_string()),
                chat_history::tokens_answer.eq(tokens_answer),
                chat_history::tokens_thinking.eq(tokens_thinking),
                chat_history::tokens_gen_ms.eq(tokens_gen_ms),
            ))
            .execute(&mut *self.lock())?;
        Ok(affected)
    }

    /// Writes the message translation with its counted tokens — the
    /// final write of a finished run. The column is a cache of the
    /// completed artifact: partial texts never land here.
    pub(crate) fn update_chat_history_translate(
        &self,
        id: i32,
        translate: &str,
        tokens_translate: i32,
    ) -> Result<usize> {
        let affected = diesel::update(chat_history::table.find(id))
            .set((
                chat_history::translate.eq(translate.to_string()),
                chat_history::tokens_translate.eq(tokens_translate),
            ))
            .execute(&mut *self.lock())?;
        Ok(affected)
    }

    /// Persists the show type of the message bubble. Returns affected
    /// rows.
    pub(crate) fn update_chat_history_show_type(&self, id: i32, show_type: ChatShowType) -> Result<usize> {
        let affected = diesel::update(chat_history::table.find(id))
            .set(chat_history::show_type.eq(show_type.as_str()))
            .execute(&mut *self.lock())?;
        Ok(affected)
    }

    /// Persists the collapsed view flag of the message bubble.
    /// Returns affected rows.
    pub(crate) fn update_chat_history_collapsed(&self, id: i32, collapsed: bool) -> Result<usize> {
        let affected = diesel::update(chat_history::table.find(id))
            .set(chat_history::collapsed.eq(collapsed))
            .execute(&mut *self.lock())?;
        Ok(affected)
    }

    /// Writes the message summary with its counted tokens — the final
    /// write of a finished run. The column is a cache of the
    /// completed artifact.
    pub(crate) fn update_chat_history_summary(&self, id: i32, summary: &str, tokens_summary: i32) -> Result<usize> {
        let affected = diesel::update(chat_history::table.find(id))
            .set((
                chat_history::summary.eq(summary.to_string()),
                chat_history::tokens_summary.eq(tokens_summary),
            ))
            .execute(&mut *self.lock())?;
        Ok(affected)
    }

    /// Active streams of one provider+model pair, oldest first.
    pub(crate) fn get_progress_chat_histories(&self, provider: &str, model: &str) -> Result<Vec<ChatHistoryData>> {
        let mut conn = self.lock();
        let rows: Vec<ChatHistoryRow> = chat_history::table
            .filter(chat_history::provider.eq(provider))
            .filter(chat_history::model.eq(model))
            .filter(chat_history::status.eq(ChatStatus::Progress.as_str()))
            .order_by(chat_history::id.asc())
            .select(ChatHistoryRow::as_select())
            .load(&mut *conn)?;
        Ok(rows.into_iter().map(ChatHistoryData::from).collect())
    }

    /// Cancels every progress row of the whole table — the startup
    /// sweep behind a killed process. Returns affected rows.
    pub(crate) fn cancel_progress_chat_histories(&self) -> Result<usize> {
        let affected = diesel::update(chat_history::table)
            .filter(chat_history::status.eq(ChatStatus::Progress.as_str()))
            .set(chat_history::status.eq(ChatStatus::Cancelled.as_str()))
            .execute(&mut *self.lock())?;
        Ok(affected)
    }

    /// Deletes the progress compress attempts of the whole table —
    /// the startup sweep behind a killed process: a dead attempt
    /// must not stay in the history. Returns affected rows.
    pub(crate) fn delete_progress_chat_histories_compress(&self) -> Result<usize> {
        self.delete_where(
            chat_history::table,
            chat_history::message_type
                .eq(ChatMessageType::Compress.as_str())
                .and(chat_history::status.eq(ChatStatus::Progress.as_str())),
        )
    }

    /// Deletes the message with the given id, returns affected rows.
    pub(crate) fn delete_chat_history(&self, id: i32) -> Result<usize> {
        self.delete(chat_history::table, id)
    }

    /// Deletes all messages of the chat, returns affected rows — the
    /// cleanup behind the chat deletion.
    pub(crate) fn delete_chat_histories(&self, chat_id: i32) -> Result<usize> {
        self.delete_where(chat_history::table, chat_history::chat_id.eq(chat_id))
    }

    /// Deletes the message with everything below it — the later
    /// messages lose their context. Returns affected rows.
    pub(crate) fn delete_chat_histories_from(&self, chat_id: i32, id: i32) -> Result<usize> {
        self.delete_where(
            chat_history::table,
            chat_history::chat_id.eq(chat_id).and(chat_history::id.ge(id)),
        )
    }

    /// Deletes everything below the message, the message stays — the
    /// truncation behind the resend. Returns affected rows.
    pub(crate) fn delete_chat_histories_after(&self, chat_id: i32, id: i32) -> Result<usize> {
        self.delete_where(
            chat_history::table,
            chat_history::chat_id.eq(chat_id).and(chat_history::id.gt(id)),
        )
    }

    /// Deletes every message of the chat except the given one; the
    /// swap behind the compression: the fresh base stays, the old
    /// history and the attempt go. Returns affected rows.
    pub(crate) fn delete_chat_histories_except(&self, chat_id: i32, id: i32) -> Result<usize> {
        self.delete_where(
            chat_history::table,
            chat_history::chat_id.eq(chat_id).and(chat_history::id.ne(id)),
        )
    }
}
