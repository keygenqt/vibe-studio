// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use anyhow::anyhow;
use diesel::prelude::*;

use crate::Store;

/// Auto-name pool: a fresh chat picks one at random. English keys —
/// the UI translates them through the locale `backend` section.
const CHAT_NAMES: [&str; 56] = [
    // -- fabrics
    "Velvet Chat",
    "Silk Chat",
    "Satin Chat",
    "Linen Chat",
    "Woolen Chat",
    "Corduroy Chat",
    "Denim Chat",
    "Knitted Chat",
    "Plush Chat",
    // -- metals
    "Golden Chat",
    "Silver Chat",
    "Copper Chat",
    "Bronze Chat",
    "Iron Chat",
    "Steel Chat",
    "Lead Chat",
    "Titanium Chat",
    "Chrome Chat",
    "Tin Chat",
    "Platinum Chat",
    // -- stone
    "Marble Chat",
    "Granite Chat",
    "Slate Chat",
    "Flint Chat",
    "Obsidian Chat",
    "Basalt Chat",
    "Onyx Chat",
    "Amber Chat",
    "Coral Chat",
    "Pearl Chat",
    // -- wood & paper
    "Wooden Chat",
    "Oak Chat",
    "Cedar Chat",
    "Bamboo Chat",
    "Paper Chat",
    "Parchment Chat",
    "Straw Chat",
    // -- glass & shine
    "Glassy Chat",
    "Porcelain Chat",
    "Crystal Chat",
    "Mirrored Chat",
    "Glossy Chat",
    // -- surface & texture
    "Smooth Chat",
    "Rough Chat",
    "Matte Chat",
    "Polished Chat",
    "Waxy Chat",
    "Clay Chat",
    // -- hide & tech
    "Leather Chat",
    "Suede Chat",
    "Carbon Chat",
    "Graphite Chat",
    // -- natural texture
    "Sandy Chat",
    "Mossy Chat",
    "Icy Chat",
    "Fluffy Chat",
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
    /// All chats, in id descending order — newest first.
    pub(crate) fn get_chats(&self) -> Result<Vec<ChatData>> {
        let mut conn = self.lock();
        let rows: Vec<ChatRow> = chats::table
            .select(ChatRow::as_select())
            .order_by(chats::id.desc())
            .load(&mut *conn)?;
        Ok(rows.into_iter().map(ChatData::from).collect())
    }

    /// The latest chat of the group; `None` = the group has no chats.
    pub(crate) fn get_last_group_chat(&self, group_chat_id: i32) -> Result<Option<ChatData>> {
        let mut conn = self.lock();
        let row = chats::table
            .filter(chats::group_chat_id.eq(group_chat_id))
            .order_by(chats::id.desc())
            .select(ChatRow::as_select())
            .first(&mut *conn)
            .optional()?;
        Ok(row.map(ChatData::from))
    }

    /// Loads one chat by id.
    pub(crate) fn get_chat(&self, id: i32) -> Result<ChatData> {
        self.find_by_id::<_, ChatRow>(chats::table, id)?
            .map(ChatData::from)
            .ok_or_else(|| anyhow!("Chat {id} not found."))
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
