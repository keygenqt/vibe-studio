// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use anyhow::anyhow;
use diesel::prelude::*;

use crate::Store;

/// A chat group: a named group of chats with its model and system
/// prompt. `id` is `None` until the row is stored — SQLite owns
/// the id.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct GroupChatData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// User-owned display name of the group.
    pub name: String,
    /// User-owned system prompt; `None` = not set yet, resolves to
    /// empty. Later summed with the model's own prompt.
    pub system_prompt: Option<String>,
    /// Id of the model the group runs on. The link is not guarded.
    // @todo: model link integrity (deletion of a referenced model) — a future task.
    pub model_id: i32,
}

diesel::table! {
    groups_chat (id) {
        id -> Integer,
        name -> Text,
        system_prompt -> Nullable<Text>,
        model_id -> Integer,
    }
}

/// The stored row as diesel reads it; mapped to `GroupChatData` on
/// the way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = groups_chat)]
struct GroupChatRow {
    id: i32,
    name: String,
    system_prompt: Option<String>,
    model_id: i32,
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = groups_chat)]
struct GroupChatNewData {
    name: String,
    system_prompt: Option<String>,
    model_id: i32,
}

/// Maps the stored row to the public type: the id becomes `Some`.
impl From<GroupChatRow> for GroupChatData {
    fn from(row: GroupChatRow) -> Self {
        GroupChatData {
            id: Some(row.id),
            name: row.name,
            system_prompt: row.system_prompt,
            model_id: row.model_id,
        }
    }
}

/// Drops the id: insert and update values never carry it.
impl From<&GroupChatData> for GroupChatNewData {
    fn from(data: &GroupChatData) -> Self {
        GroupChatNewData {
            name: data.name.clone(),
            system_prompt: data.system_prompt.clone(),
            model_id: data.model_id,
        }
    }
}

impl Store {
    /// All chat groups, in id order — `id` is the rowid alias, the
    /// table has no secondary indexes.
    pub(crate) fn get_groups_chat(&self) -> Result<Vec<GroupChatData>> {
        Ok(self
            .select::<_, GroupChatRow>(groups_chat::table)?
            .into_iter()
            .map(GroupChatData::from)
            .collect())
    }

    /// Loads one group by id.
    pub(crate) fn get_group_chat(&self, id: i32) -> Result<GroupChatData> {
        self.find_by_id::<_, GroupChatRow>(groups_chat::table, id)?
            .map(GroupChatData::from)
            .ok_or_else(|| anyhow!("Group chat {id} not found."))
    }

    /// Inserts a new group (`id = None`) or updates the one with the
    /// given id; returns the stored row.
    pub(crate) fn save_group_chat(&self, group_chat: &GroupChatData) -> Result<GroupChatData> {
        let values = GroupChatNewData::from(group_chat);
        let row: GroupChatRow = self.save(groups_chat::table, group_chat.id, values)?;
        Ok(GroupChatData::from(row))
    }

    /// Deletes the group with the given id, returns affected rows.
    pub(crate) fn delete_group_chat(&self, id: i32) -> Result<usize> {
        self.delete(groups_chat::table, id)
    }
}
