// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde_with::TimestampMilliSeconds;
use serde_with::serde_as;

use crate::Store;

/// A message role in the chat history. Serialized lowercase; an
/// unknown stored value reads as `Error` — broken data must not pass
/// for a normal message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChatRole {
    /// A message from the user.
    User,
    /// A message from the model.
    Assistant,
    /// A failed request: the error text is kept as the message.
    Error,
}

impl ChatRole {
    /// The string form stored in the `role` column.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::User => "user",
            Self::Assistant => "assistant",
            Self::Error => "error",
        }
    }

    /// Parses the stored string; an unknown value falls back to `Error`.
    pub fn from_value(value: &str) -> Self {
        match value {
            "user" => Self::User,
            "assistant" => Self::Assistant,
            _ => Self::Error,
        }
    }
}

/// A message of a chat. `id` is `None` until the row is stored —
/// SQLite owns the id. Append-only: rows are added, never updated.
#[serde_as]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ChatHistoryData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the chat the message belongs to.
    pub chat_id: i32,
    /// Who produced the message.
    pub role: ChatRole,
    /// The message text; for `Error` — the error text.
    pub text: String,
    /// Store-owned: when the row was born; JS gets unix millis.
    #[serde_as(as = "TimestampMilliSeconds<i64>")]
    pub created_at: NaiveDateTime,
}

diesel::table! {
    chat_history (id) {
        id -> Integer,
        chat_id -> Integer,
        role -> Text,
        text -> Text,
        created_at -> Timestamp,
    }
}

/// The stored row as diesel reads it; mapped to `ChatHistoryData` on
/// the way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = chat_history)]
struct ChatHistoryRow {
    id: i32,
    chat_id: i32,
    role: String,
    text: String,
    created_at: NaiveDateTime,
}

impl From<ChatHistoryRow> for ChatHistoryData {
    fn from(row: ChatHistoryRow) -> Self {
        ChatHistoryData {
            id: Some(row.id),
            chat_id: row.chat_id,
            role: ChatRole::from_value(&row.role),
            text: row.text,
            created_at: row.created_at,
        }
    }
}

/// Insert values: the id and the timestamp are owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = chat_history)]
struct ChatHistoryNewData {
    chat_id: i32,
    role: String,
    text: String,
}

impl Store {
    /// All messages of the chat, in id order — oldest first.
    pub(crate) fn get_chat_histories(&self, chat_id: i32) -> Result<Vec<ChatHistoryData>> {
        let mut conn = self.lock();
        let rows: Vec<ChatHistoryRow> = chat_history::table
            .filter(chat_history::chat_id.eq(chat_id))
            .order_by(chat_history::id.asc())
            .select(ChatHistoryRow::as_select())
            .load(&mut *conn)?;
        Ok(rows.into_iter().map(ChatHistoryData::from).collect())
    }

    /// Appends a message to the chat history; returns the stored row.
    pub(crate) fn add_chat_history(&self, chat_id: i32, role: ChatRole, text: &str) -> Result<ChatHistoryData> {
        let row: ChatHistoryRow = self.save(
            chat_history::table,
            None,
            ChatHistoryNewData {
                chat_id,
                role: role.as_str().to_string(),
                text: text.to_string(),
            },
        )?;
        Ok(ChatHistoryData::from(row))
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
}
