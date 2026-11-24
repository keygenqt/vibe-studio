// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The groups chat block commands: groups, chats and their view state.

use tauri::State;
use tauri::WebviewWindow;

use studio_core::Store;

use super::data::chat_data::ChatData;
use super::data::group_chat_data::GroupChatData;
use super::data::group_chat_history_data::GroupChatHistoryData;
use super::data::groups_chat_state::GroupsChatData;
use crate::chat::data::chat_state::ChatStateData;
use crate::events::OkEmit;

/// All chat groups.
#[tauri::command]
pub fn get_groups_chat(store: State<Store>) -> Vec<GroupChatData> {
    studio_core::get_groups_chat(&store)
        .into_iter()
        .map(GroupChatData::from)
        .collect()
}

/// Loads one group by id.
#[tauri::command]
pub fn get_group_chat(store: State<Store>, id: i32) -> Result<GroupChatData, String> {
    studio_core::get_group_chat(&store, id)
        .map(GroupChatData::from)
        .map_err(|e| e.to_string())
}

/// Validates and persists; `id: null` inserts, otherwise updates.
/// Emits the fresh state of the groups chat block, returns the saved row.
#[tauri::command]
pub fn save_group_chat(
    window: WebviewWindow,
    store: State<Store>,
    group_chat: GroupChatData,
) -> Result<GroupChatData, String> {
    let saved = studio_core::save_group_chat(&store, &studio_core::GroupChatData::from(&group_chat))
        .map(GroupChatData::from)
        .map_err(|e| e.to_string())?;
    OkEmit(&window, GroupsChatData::new(&store))?;
    Ok(saved)
}

/// Deletes the group by id; emits and returns the fresh state of
/// the groups chat block.
#[tauri::command]
pub fn delete_group_chat(window: WebviewWindow, store: State<Store>, id: i32) -> Result<GroupsChatData, String> {
    studio_core::delete_group_chat(&store, id).map_err(|e| e.to_string())?;
    OkEmit(&window, GroupsChatData::new(&store))
}

/// All chats.
#[tauri::command]
pub fn get_chats(store: State<Store>) -> Vec<ChatData> {
    studio_core::get_chats(&store).into_iter().map(ChatData::from).collect()
}

/// Validates and persists; `id: null` inserts with a random pool
/// name, otherwise updates. Emits the fresh state of the groups
/// chat block, returns the saved row.
#[tauri::command]
pub fn save_chat(window: WebviewWindow, store: State<Store>, chat: ChatData) -> Result<ChatData, String> {
    let saved = studio_core::save_chat(&store, &studio_core::ChatData::from(&chat))
        .map(ChatData::from)
        .map_err(|e| e.to_string())?;
    OkEmit(&window, GroupsChatData::new(&store))?;
    Ok(saved)
}

/// Deletes the chat by id; emits and returns the fresh state of
/// the groups chat block.
#[tauri::command]
pub fn delete_chat(window: WebviewWindow, store: State<Store>, id: i32) -> Result<GroupsChatData, String> {
    studio_core::delete_chat(&store, id).map_err(|e| e.to_string())?;
    OkEmit(&window, GroupsChatData::new(&store))
}

/// All group chat history rows.
#[tauri::command]
pub fn get_group_chat_histories(store: State<Store>) -> Vec<GroupChatHistoryData> {
    studio_core::get_group_chat_histories(&store)
        .into_iter()
        .map(GroupChatHistoryData::from)
        .collect()
}

/// Persists the view flags of a group; emits and returns the fresh
/// state of the groups chat block.
#[tauri::command]
pub fn set_group_chat_view(
    window: WebviewWindow,
    store: State<Store>,
    group_chat_id: i32,
    collapsed_group: bool,
    collapsed_chats: bool,
) -> Result<GroupsChatData, String> {
    studio_core::set_group_chat_view(&store, group_chat_id, collapsed_group, collapsed_chats)
        .map_err(|e| e.to_string())?;
    OkEmit(&window, GroupsChatData::new(&store))
}

/// Selects the group (`chatId = null`) or its chat as the single
/// active one; emits and returns the fresh state of the groups
/// chat block.
#[tauri::command]
pub fn select_group_chat(
    window: WebviewWindow,
    store: State<Store>,
    group_chat_id: i32,
    chat_id: Option<i32>,
) -> Result<GroupsChatData, String> {
    studio_core::select_group_chat(&store, group_chat_id, chat_id).map_err(|e| e.to_string())?;
    OkEmit(&window, GroupsChatData::new(&store))
}

/// Renames the chat with a model-generated name; the chat row feeds
/// two blocks — the groups chat copy and the chat page header — both
/// get the fresh state. Returns the groups chat block state.
#[tauri::command]
pub async fn chat_regenerate_name(
    window: WebviewWindow,
    store: State<'_, Store>,
    chat_id: i32,
) -> Result<GroupsChatData, String> {
    studio_core::chat_regenerate_name(&store, chat_id)
        .await
        .map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))?;
    OkEmit(&window, GroupsChatData::new(&store))
}
