// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The groups_chat table: GroupChatData and its Store access.

use anyhow::Result;
use anyhow::anyhow;
use diesel::prelude::*;

use crate::Store;

/// A chat group: a named group of chats with its model and system
/// prompt. `id` is `None` until the row is stored — SQLite owns
/// the id.
#[derive(Debug, Clone, PartialEq)]
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
    /// User-owned avatar icon name; `None` = the first letter.
    pub icon: Option<String>,
    /// User-owned icon color scheme key; `None` = the accent color.
    pub icon_color: Option<String>,
}

diesel::table! {
    groups_chat (id) {
        id -> Integer,
        name -> Text,
        system_prompt -> Nullable<Text>,
        model_id -> Integer,
        icon -> Nullable<Text>,
        icon_color -> Nullable<Text>,
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
    icon: Option<String>,
    icon_color: Option<String>,
}

/// Insert values: the id is owned by SQLite. `AsChangeset` only
/// satisfies the generic `save` signature — update goes concrete.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = groups_chat)]
struct GroupChatNewData {
    name: String,
    system_prompt: Option<String>,
    model_id: i32,
    icon: Option<String>,
    icon_color: Option<String>,
}

/// Maps the stored row to the public type: the id becomes `Some`.
impl From<GroupChatRow> for GroupChatData {
    fn from(row: GroupChatRow) -> Self {
        GroupChatData {
            id: Some(row.id),
            name: row.name,
            system_prompt: row.system_prompt,
            model_id: row.model_id,
            icon: row.icon,
            icon_color: row.icon_color,
        }
    }
}

/// Drops the id: insert values never carry it.
impl From<&GroupChatData> for GroupChatNewData {
    fn from(data: &GroupChatData) -> Self {
        GroupChatNewData {
            name: data.name.clone(),
            system_prompt: data.system_prompt.clone(),
            model_id: data.model_id,
            icon: data.icon.clone(),
            icon_color: data.icon_color.clone(),
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
    /// given id; returns the stored row. Update goes through the
    /// concrete setter tuple: `None` fields write NULL, the generic
    /// `AsChangeset` would silently skip them.
    pub(crate) fn save_group_chat(&self, group_chat: &GroupChatData) -> Result<GroupChatData> {
        match group_chat.id {
            Some(id) => {
                diesel::update(groups_chat::table.find(id))
                    .set((
                        groups_chat::name.eq(group_chat.name.clone()),
                        groups_chat::system_prompt.eq(group_chat.system_prompt.clone()),
                        groups_chat::model_id.eq(group_chat.model_id),
                        groups_chat::icon.eq(group_chat.icon.clone()),
                        groups_chat::icon_color.eq(group_chat.icon_color.clone()),
                    ))
                    .execute(&mut *self.lock())?;
                self.get_group_chat(id)
            }
            None => {
                let values = GroupChatNewData::from(group_chat);
                let row: GroupChatRow = self.save(groups_chat::table, None, values)?;
                Ok(GroupChatData::from(row))
            }
        }
    }

    /// Deletes the group with the given id, returns affected rows.
    pub(crate) fn delete_group_chat(&self, id: i32) -> Result<usize> {
        self.delete(groups_chat::table, id)
    }
}
