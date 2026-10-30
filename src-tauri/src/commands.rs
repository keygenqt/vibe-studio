// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'facts']
// INFO: The JS surface: one command per core function, named after it.

use tauri::AppHandle;
use tauri::State;
use tauri::WebviewWindow;

use studio_core::ChatData;
use studio_core::ChatHistoryData;
use studio_core::GroupChatData;
use studio_core::GroupChatHistoryData;
use studio_core::ModelInfoData;
use studio_core::ProviderData;
use studio_core::ProviderInfoData;
use studio_core::ProviderModelData;
use studio_core::Store;
use studio_core::WorkspaceData;

use crate::data::app_info::AppInfoData;
use crate::data::chat_state::ChatStateData;
use crate::data::event_data::EventData;
use crate::data::event_data::EventKey;
use crate::data::groups_chat_state::GroupsChatData;
use crate::data::providers_state::ProvidersData;

use crate::events::emit_event_chat;
use crate::events::emit_event_groups_chat;
use crate::events::emit_event_providers;
use crate::events::emit_event_workspace;

// ─────────────────────────────────────────────
// Workspace
// ─────────────────────────────────────────────

/// Loads the shell environment.
#[tauri::command]
pub fn get_workspace(store: State<Store>) -> WorkspaceData {
    studio_core::get_workspace(&store)
}

/// Persists the shell environment; every mutation ends with the emit.
#[tauri::command]
pub fn save_workspace(
    window: WebviewWindow,
    store: State<Store>,
    workspace: WorkspaceData,
) -> Result<WorkspaceData, String> {
    let saved = studio_core::save_workspace(&store, &workspace).map_err(|e| e.to_string())?;
    emit_event_workspace(&window, EventData::new(EventKey::Workspace, &saved));
    Ok(saved)
}

// ─────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────

/// Catalog of supported provider types for the add form.
#[tauri::command]
pub fn get_providers_catalog() -> Vec<ProviderInfoData> {
    studio_core::get_providers_catalog()
}

/// All configured providers.
#[tauri::command]
pub fn get_providers(store: State<Store>) -> Vec<ProviderData> {
    studio_core::get_providers(&store)
}

/// Loads one provider by id.
#[tauri::command]
pub fn get_provider(store: State<Store>, id: i32) -> Result<ProviderData, String> {
    studio_core::get_provider(&store, id).map_err(|e| e.to_string())
}

/// Validates and persists; `id: null` inserts, otherwise updates.
/// Emits and returns the fresh state of the providers block; the
/// `provider` field carries the stored row.
#[tauri::command]
pub fn save_provider(
    window: WebviewWindow,
    store: State<Store>,
    provider: ProviderData,
) -> Result<ProvidersData, String> {
    let saved = studio_core::save_provider(&store, &provider).map_err(|e| e.to_string())?;
    let mut state = ProvidersData::new(&store);
    state.provider = Some(saved);
    emit_event_providers(&window, EventData::new(EventKey::Providers, &state));
    Ok(state)
}

/// Deletes the provider by id; emits and returns the fresh state of
/// the providers block.
#[tauri::command]
pub fn delete_provider(window: WebviewWindow, store: State<Store>, id: i32) -> Result<ProvidersData, String> {
    studio_core::delete_provider(&store, id).map_err(|e| e.to_string())?;
    let state = ProvidersData::new(&store);
    emit_event_providers(&window, EventData::new(EventKey::Providers, &state));
    Ok(state)
}

/// Fetches the live model catalog of a provider host.
#[tauri::command]
pub async fn get_provider_models_by_type(
    kind: String,
    host: String,
    api_key: Option<String>,
) -> Result<Vec<ModelInfoData>, String> {
    studio_core::get_provider_models_by_type(&kind, &host, api_key.as_deref())
        .await
        .map_err(|e| e.to_string())
}

/// All models, optionally of one provider — `None` takes the whole
/// table behind the providers block state.
#[tauri::command]
pub fn get_provider_models(store: State<Store>, provider_id: Option<i32>) -> Vec<ProviderModelData> {
    studio_core::get_provider_models(&store, provider_id)
}

/// Loads one model by id.
#[tauri::command]
pub fn get_provider_model(store: State<Store>, id: i32) -> Result<ProviderModelData, String> {
    studio_core::get_provider_model(&store, id).map_err(|e| e.to_string())
}

/// Validates and persists the model row. Emits and returns the
/// fresh state of the providers block.
#[tauri::command]
pub fn save_provider_model(
    window: WebviewWindow,
    store: State<Store>,
    model: ProviderModelData,
) -> Result<ProvidersData, String> {
    studio_core::save_provider_model(&store, &model).map_err(|e| e.to_string())?;
    let state = ProvidersData::new(&store);
    emit_event_providers(&window, EventData::new(EventKey::Providers, &state));
    Ok(state)
}

/// Persists the selection of the provider's model catalog. Emits
/// and returns the fresh state of the providers block.
#[tauri::command]
pub async fn save_provider_models(
    window: WebviewWindow,
    store: State<'_, Store>,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<ProvidersData, String> {
    studio_core::save_provider_models(&store, provider_id, checked)
        .await
        .map_err(|e| e.to_string())?;
    let state = ProvidersData::new(&store);
    emit_event_providers(&window, EventData::new(EventKey::Providers, &state));
    Ok(state)
}

// ─────────────────────────────────────────────
// Groups Chat
// ─────────────────────────────────────────────

/// All chat groups.
#[tauri::command]
pub fn get_groups_chat(store: State<Store>) -> Vec<GroupChatData> {
    studio_core::get_groups_chat(&store)
}

/// Loads one group by id.
#[tauri::command]
pub fn get_group_chat(store: State<Store>, id: i32) -> Result<GroupChatData, String> {
    studio_core::get_group_chat(&store, id).map_err(|e| e.to_string())
}

/// Validates and persists; `id: null` inserts, otherwise updates.
/// Emits and returns the fresh state of the groups chat block.
#[tauri::command]
pub fn save_group_chat(
    window: WebviewWindow,
    store: State<Store>,
    group_chat: GroupChatData,
) -> Result<GroupsChatData, String> {
    studio_core::save_group_chat(&store, &group_chat).map_err(|e| e.to_string())?;
    let state = GroupsChatData::new(&store);
    emit_event_groups_chat(&window, EventData::new(EventKey::GroupsChat, &state));
    Ok(state)
}

/// Deletes the group by id; emits and returns the fresh state of
/// the groups chat block.
#[tauri::command]
pub fn delete_group_chat(window: WebviewWindow, store: State<Store>, id: i32) -> Result<GroupsChatData, String> {
    studio_core::delete_group_chat(&store, id).map_err(|e| e.to_string())?;
    let state = GroupsChatData::new(&store);
    emit_event_groups_chat(&window, EventData::new(EventKey::GroupsChat, &state));
    Ok(state)
}

/// All chats.
#[tauri::command]
pub fn get_chats(store: State<Store>) -> Vec<ChatData> {
    studio_core::get_chats(&store)
}

/// Validates and persists; `id: null` inserts with a random pool
/// name, otherwise updates. Emits and returns the fresh state of
/// the groups chat block.
#[tauri::command]
pub fn save_chat(window: WebviewWindow, store: State<Store>, chat: ChatData) -> Result<GroupsChatData, String> {
    studio_core::save_chat(&store, &chat).map_err(|e| e.to_string())?;
    let state = GroupsChatData::new(&store);
    emit_event_groups_chat(&window, EventData::new(EventKey::GroupsChat, &state));
    Ok(state)
}

/// Deletes the chat by id; emits and returns the fresh state of
/// the groups chat block.
#[tauri::command]
pub fn delete_chat(window: WebviewWindow, store: State<Store>, id: i32) -> Result<GroupsChatData, String> {
    studio_core::delete_chat(&store, id).map_err(|e| e.to_string())?;
    let state = GroupsChatData::new(&store);
    emit_event_groups_chat(&window, EventData::new(EventKey::GroupsChat, &state));
    Ok(state)
}

/// All group chat history rows.
#[tauri::command]
pub fn get_group_chat_histories(store: State<Store>) -> Vec<GroupChatHistoryData> {
    studio_core::get_group_chat_histories(&store)
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
    let state = GroupsChatData::new(&store);
    emit_event_groups_chat(&window, EventData::new(EventKey::GroupsChat, &state));
    Ok(state)
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
    let state = GroupsChatData::new(&store);
    emit_event_groups_chat(&window, EventData::new(EventKey::GroupsChat, &state));
    Ok(state)
}

// ─────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────

/// All messages of the chat, oldest first.
#[tauri::command]
pub fn chat_get_history(store: State<Store>, chat_id: i32) -> Result<Vec<ChatHistoryData>, String> {
    studio_core::chat_get_history(&store, chat_id).map_err(|e| e.to_string())
}

/// Sends the user's message to the chat's model and records the
/// exchange; emits and returns the fresh state of the chat block.
#[tauri::command]
pub async fn chat_send_message(
    window: WebviewWindow,
    store: State<'_, Store>,
    chat_id: i32,
    text: String,
) -> Result<ChatStateData, String> {
    studio_core::chat_send_message(&store, chat_id, &text)
        .await
        .map_err(|e| e.to_string())?;
    let state = ChatStateData::new(&store, chat_id);
    emit_event_chat(&window, EventData::new(EventKey::Chat, &state));
    Ok(state)
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

/// The current OS theme — the startup value for the shell.
#[tauri::command]
pub fn get_system_theme() -> String {
    studio_core::get_system_theme().as_str().to_string()
}

/// Serves the app version and debug flag to the shell.
#[tauri::command]
pub fn get_app_info(app: AppHandle) -> AppInfoData {
    AppInfoData {
        version: app.package_info().version.to_string(),
        is_debug: cfg!(debug_assertions),
    }
}
