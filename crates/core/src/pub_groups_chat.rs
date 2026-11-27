// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The groups chat block: the groups, their chats and the view state.

//! The groups chat block functions: the group CRUD and the group
//! history — the view flags, the selection and the counters.

use anyhow::Result;

use studio_states::GroupChatData;
use studio_states::GroupChatHistoryData;
use studio_states::Store;

/// All chat groups; a store error yields an empty list — loading
/// never blocks the UI.
pub fn get_groups_chat(store: &Store) -> Vec<GroupChatData> {
    studio_states::get_groups_chat(store).unwrap_or_default()
}

/// Loads one group by id.
pub fn get_group_chat(store: &Store, id: i32) -> Result<GroupChatData> {
    studio_states::get_group_chat(store, id)
}

/// Validates and persists the group. The UI is not trusted: a blank
/// name is an error, the model must exist; everything else is stored
/// as sent — `icon` and `icon_color` are UI keys, resolved at render;
/// `null` falls back to the letter and the accent. A fresh group is
/// born into the history active, an update counts.
pub fn save_group_chat(store: &Store, group_chat: &GroupChatData) -> Result<GroupChatData> {
    if group_chat.name.trim().is_empty() {
        anyhow::bail!("Name must not be blank.");
    }
    if studio_states::get_provider_model(store, group_chat.model_id).is_err() {
        anyhow::bail!("Unknown model.");
    }
    let saved = studio_states::save_group_chat(store, group_chat)?;
    let id = saved.id.expect("stored group id");
    match group_chat.id {
        None => {
            studio_states::add_group_chat_history(store, id)?;
        }
        Some(_) => {
            studio_states::bump_group_chat_history_updates(store, id)?;
        }
    }
    Ok(saved)
}

/// Deletes the group with its chats and history; a missing group is
/// a no-op.
pub fn delete_group_chat(store: &Store, id: i32) -> Result<()> {
    for chat in studio_states::get_chats(store)?
        .iter()
        .filter(|chat| chat.group_chat_id == id)
    {
        studio_states::delete_chat_histories(store, chat.id.expect("stored chat id"))?;
    }
    studio_states::delete_group_chats(store, id)?;
    studio_states::delete_group_chat(store, id)?;
    studio_states::delete_group_chat_history(store, id)?;
    Ok(())
}

/// All group chat history rows; a store error yields an empty list —
/// loading never blocks the UI.
pub fn get_group_chat_histories(store: &Store) -> Vec<GroupChatHistoryData> {
    studio_states::get_group_chat_histories(store).unwrap_or_default()
}

/// Persists the view flags of the group block and its chat list. The
/// UI is not trusted: the group must exist.
pub fn set_group_chat_view(
    store: &Store,
    group_chat_id: i32,
    collapsed_group: bool,
    collapsed_chats: bool,
) -> Result<()> {
    if studio_states::get_group_chat(store, group_chat_id).is_err() {
        anyhow::bail!("Unknown group.");
    }
    studio_states::set_group_chat_view(store, group_chat_id, collapsed_group, collapsed_chats)
}

/// Selects the group or its chat as the single active one. The UI is
/// not trusted: the group must exist, the chat must exist and belong
/// to the group. A group without a chat selection takes its newest
/// chat; a chatless group takes none. Counts the activation.
pub fn select_group_chat(store: &Store, group_chat_id: i32, chat_id: Option<i32>) -> Result<()> {
    studio_states::get_group_chat(store, group_chat_id)?;
    let chat_id = match chat_id {
        Some(chat_id) => {
            if studio_states::get_chat(store, chat_id)?.group_chat_id != group_chat_id {
                anyhow::bail!("Unknown chat.");
            }
            Some(chat_id)
        }
        None => studio_states::get_last_group_chat(store, group_chat_id)?.map(|chat| chat.id.expect("stored chat id")),
    };
    studio_states::set_active_group_chat(store, group_chat_id, chat_id)?;
    studio_states::bump_group_chat_history_activations(store, group_chat_id)
}
