// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat groups and their life records, published as the flat API.

//! The chat groups and their life records: the flat API over the
//! `groups_chat` and `group_chat_history` tables.

use anyhow::Result;

use crate::data::group_chat_history::GroupChatHistoryData;
use crate::data::groups_chat::GroupChatData;
use crate::db::store::Store;

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

/// All group chat history rows.
pub fn get_group_chat_histories(store: &Store) -> Result<Vec<GroupChatHistoryData>> {
    store.get_group_chat_histories()
}

/// Adds the history row born with the group and activates the fresh group.
pub fn add_group_chat_history(store: &Store, group_chat_id: i32) -> Result<GroupChatHistoryData> {
    store.add_group_chat_history(group_chat_id)
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
