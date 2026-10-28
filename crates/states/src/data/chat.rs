// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;

/// Auto-name pool: a fresh chat picks one at random. English keys —
/// the UI translates them through the locale `backend` section.
const CHAT_NAMES: [&str; 20] = [
    "Conjuring a name...",
    "Brewing the title...",
    "Summoning the magic...",
    "Whispering words...",
    "Naming this thing...",
    "Cooking up a title...",
    "Chasing inspiration...",
    "Forging a name...",
    "Painting words...",
    "Mixing the letters...",
    "Weaving a title...",
    "Stirring the muse...",
    "Dreaming up a name...",
    "Polishing the title...",
    "Sharpening the words...",
    "Catching the idea...",
    "Baking a name...",
    "Distilling the words...",
    "Spinning the yarn...",
    "Tuning the title...",
];

/// Picks a random pool name: no `rand` dependency, the millisecond
/// clock is enough for a name flavor.
fn random_name() -> String {
    let millis = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as usize)
        .unwrap_or(0);
    CHAT_NAMES[millis % CHAT_NAMES.len()].to_string()
}

/// A chat inside a group. `id` is `None` until the row is stored —
/// SQLite owns the id.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ChatData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Auto-generated name — an English key the UI translates.
    pub name: String,
    /// Id of the group the chat belongs to. The link is not guarded.
    // @todo: group link integrity (deletion of a referenced group) — a future task.
    pub group_chat_id: i32,
}

diesel::table! {
    chats (id) {
        id -> Integer,
        name -> Text,
        group_chat_id -> Integer,
    }
}

/// The stored row as diesel reads it; mapped to `ChatData` on the
/// way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = chats)]
struct ChatRow {
    id: i32,
    name: String,
    group_chat_id: i32,
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = chats)]
struct ChatNewData {
    name: String,
    group_chat_id: i32,
}

/// Maps the stored row to the public type: the id becomes `Some`.
impl From<ChatRow> for ChatData {
    fn from(row: ChatRow) -> Self {
        ChatData {
            id: Some(row.id),
            name: row.name,
            group_chat_id: row.group_chat_id,
        }
    }
}

/// Drops the id: insert and update values never carry it.
impl From<&ChatData> for ChatNewData {
    fn from(data: &ChatData) -> Self {
        ChatNewData {
            name: data.name.clone(),
            group_chat_id: data.group_chat_id,
        }
    }
}

impl Store {
    /// All chats, in id order — `id` is the rowid alias, the table
    /// has no secondary indexes.
    pub(crate) fn get_chats(&self) -> Result<Vec<ChatData>> {
        Ok(self
            .select::<_, ChatRow>(chats::table)?
            .into_iter()
            .map(ChatData::from)
            .collect())
    }

    /// Inserts a new chat (`id = None`) or updates the one with the
    /// given id; returns the stored row. An empty name picks a
    /// random one from the pool.
    pub(crate) fn save_chat(&self, chat: &ChatData) -> Result<ChatData> {
        let mut chat = chat.clone();
        if chat.name.is_empty() {
            chat.name = random_name();
        }
        let values = ChatNewData::from(&chat);
        let row: ChatRow = self.save(chats::table, chat.id, values)?;
        Ok(ChatData::from(row))
    }

    /// Deletes the chat with the given id, returns affected rows.
    pub(crate) fn delete_chat(&self, id: i32) -> Result<usize> {
        self.delete(chats::table, id)
    }

    /// Deletes all chats of the group, returns affected rows — the
    /// cleanup behind the group deletion.
    pub(crate) fn delete_group_chats(&self, group_chat_id: i32) -> Result<usize> {
        self.delete_where(chats::table, chats::group_chat_id.eq(group_chat_id))
    }
}
