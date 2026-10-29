// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme', 'facts']

//! Vibe Studio core — facade over sub-crates. UI shells talk to this
//! crate only.

use anyhow::Result;
use std::path::Path;

pub(crate) mod theme;

pub use studio_cluster::ModelInfoData;
pub use studio_cluster::ProviderInfoData;
pub use studio_states::ChatData;
pub use studio_states::GroupChatData;
pub use studio_states::GroupChatHistoryData;
pub use studio_states::ProviderData;
pub use studio_states::ProviderModelData;
pub use studio_states::Store;
pub use studio_states::WorkspaceData;

pub use theme::ThemeChoice;

// ─────────────────────────────────────────────
// Workspace
// ─────────────────────────────────────────────

/// Loads the shell environment; a missing row falls back to `Default`
/// — untouched values stay `None`.
pub fn get_workspace(store: &Store) -> WorkspaceData {
    studio_states::get_workspace(store).unwrap_or_default()
}

/// Persists the shell environment as the single row, returns it.
pub fn save_workspace(store: &Store, workspace: &WorkspaceData) -> Result<WorkspaceData> {
    studio_states::save_workspace(store, workspace)
}

// ─────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────

/// Catalog of supported provider types — the single source for the
/// add form and for validation.
pub fn get_providers_catalog() -> Vec<ProviderInfoData> {
    studio_cluster::get_providers()
}

/// All configured providers; a store error yields an empty list —
/// loading never blocks the UI.
pub fn get_providers(store: &Store) -> Vec<ProviderData> {
    studio_states::get_providers(store).unwrap_or_default()
}

/// Loads one provider by id.
pub fn get_provider(store: &Store, id: i32) -> Result<ProviderData> {
    studio_states::get_provider(store, id)
}

/// Validates against the cluster catalog, then inserts or updates.
/// The UI is not trusted: the kind must match the catalog exactly,
/// blank name and host are errors; everything else is stored as sent.
pub fn save_provider(store: &Store, provider: &ProviderData) -> Result<ProviderData> {
    if studio_cluster::get_provider_by_kind(&provider.provider).is_none() {
        anyhow::bail!("Unknown provider.");
    }
    if provider.name.trim().is_empty() {
        anyhow::bail!("Name must not be blank.");
    }
    if provider.host.trim().is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    studio_states::save_provider(store, provider)
}

/// Deletes the provider; a missing row is a no-op.
pub fn delete_provider(store: &Store, id: i32) -> Result<()> {
    studio_states::delete_provider(store, id)?;
    Ok(())
}

/// All models, optionally of one provider; a store error yields an
/// empty list — loading never blocks the UI.
pub fn get_provider_models(store: &Store, provider_id: Option<i32>) -> Vec<ProviderModelData> {
    studio_states::get_provider_models(store, provider_id).unwrap_or_default()
}

/// Loads one model by id.
pub fn get_provider_model(store: &Store, id: i32) -> Result<ProviderModelData> {
    studio_states::get_provider_model(store, id)
}

/// Fetches the live model catalog of a provider host. The kind is not
/// trusted: must be in the catalog; the host is trimmed, blank is an
/// error. Embedding models are filtered out on the cluster layer.
pub async fn get_provider_models_by_type(kind: &str, host: &str, api_key: Option<&str>) -> Result<Vec<ModelInfoData>> {
    let host = host.trim();
    if host.is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    let provider =
        studio_cluster::get_provider_by_kind(kind).ok_or_else(|| anyhow::anyhow!("Unknown provider kind: {kind}."))?;
    Ok(studio_cluster::get_provider_models_by_type(provider, host, api_key).await?)
}

/// Validates and persists the model; the UI is not trusted: the id
/// must exist, whitespace-only texts and out-of-range config values
/// are errors; everything else is stored as sent.
pub fn save_provider_model(store: &Store, model: &ProviderModelData) -> Result<ProviderModelData> {
    let Some(id) = model.id else {
        anyhow::bail!("Model id is required.");
    };
    if studio_states::get_provider_model(store, id).is_err() {
        anyhow::bail!("Unknown model.");
    }
    if model
        .display_name
        .as_deref()
        .is_some_and(|text| !text.is_empty() && text.trim().is_empty())
    {
        anyhow::bail!("Display name must not be blank.");
    }
    if model
        .system_prompt
        .as_deref()
        .is_some_and(|text| !text.is_empty() && text.trim().is_empty())
    {
        anyhow::bail!("System prompt must not be blank.");
    }
    if model.temperature.is_some_and(|value| !(0.0..=2.0).contains(&value)) {
        anyhow::bail!("Temperature must be between 0 and 2.");
    }
    if model.seed.is_some_and(|value| value < 0) {
        anyhow::bail!("Seed must not be negative.");
    }
    if model.num_ctx.is_some_and(|value| value < 1) {
        anyhow::bail!("Context must not be empty.");
    }
    if model.num_predict.is_some_and(|value| value < 1) {
        anyhow::bail!("Predict limit must not be empty.");
    }
    studio_states::save_provider_model(store, model)
}

/// Persists the selection of one provider's model catalog: fetches
/// the live list from the host and upserts the selected models with
/// fresh facts; models outside the selection are removed. The UI
/// sends only the provider id and the selected names. A fetch error
/// aborts before any mutation — a failed sync never touches the
/// table. An empty selection is valid.
pub async fn save_provider_models(
    store: &Store,
    provider_id: i32,
    checked: Vec<String>,
) -> Result<Vec<ProviderModelData>> {
    let provider = studio_states::get_provider(store, provider_id)?;
    let models =
        crate::get_provider_models_by_type(&provider.provider, &provider.host, provider.api_key.as_deref()).await?;
    let rows: Vec<ProviderModelData> = models
        .into_iter()
        .filter(|model| checked.iter().any(|name| *name == model.name))
        .map(|model| ProviderModelData {
            provider_id,
            name: model.name,
            params: model.params,
            vision: model.vision,
            tools: model.tools,
            reasoning: model.thinking,
            ..Default::default()
        })
        .collect();
    studio_states::save_provider_models(store, provider_id, &rows)
}

// ─────────────────────────────────────────────
// Groups Chat
// ─────────────────────────────────────────────

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
/// as sent. A fresh group is born into the history active, an update
/// counts.
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
            studio_states::create_group_chat_history(store, id)?;
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
    studio_states::delete_group_chats(store, id)?;
    studio_states::delete_group_chat(store, id)?;
    studio_states::delete_group_chat_history(store, id)?;
    Ok(())
}

// ─────────────────────────────────────────────
// Chats
// ─────────────────────────────────────────────

/// All chats; a store error yields an empty list — loading never
/// blocks the UI.
pub fn get_chats(store: &Store) -> Vec<ChatData> {
    studio_states::get_chats(store).unwrap_or_default()
}

/// Validates and persists the chat. The UI is not trusted: the group
/// must exist; an empty name is filled with a random pool name on
/// the states layer. Everything else is stored as sent. A fresh chat
/// becomes the selected one of its group and counts as created.
pub fn save_chat(store: &Store, chat: &ChatData) -> Result<ChatData> {
    if studio_states::get_group_chat(store, chat.group_chat_id).is_err() {
        anyhow::bail!("Unknown group.");
    }
    let saved = studio_states::save_chat(store, chat)?;
    if chat.id.is_none() {
        let id = saved.id.expect("stored chat id");
        studio_states::set_active_group_chat(store, saved.group_chat_id, Some(id))?;
        studio_states::bump_group_chat_history_chats_created(store, saved.group_chat_id)?;
    }
    Ok(saved)
}

/// Deletes the chat; a missing row is a no-op. If the deleted chat
/// was the selected one, the group falls back to its newest remaining
/// chat — the same as a group click; a chatless group keeps no chat.
pub fn delete_chat(store: &Store, id: i32) -> Result<()> {
    let chat = studio_states::get_chat(store, id).ok();
    studio_states::delete_chat(store, id)?;
    if let Some(chat) = chat {
        if studio_states::clear_group_chat_history_selected_chat(store, id)? != 0 {
            if let Some(last) = studio_states::get_last_group_chat(store, chat.group_chat_id)? {
                studio_states::set_active_group_chat(
                    store,
                    chat.group_chat_id,
                    Some(last.id.expect("stored chat id")),
                )?;
            }
        }
    }
    Ok(())
}

// ─────────────────────────────────────────────
// Group Chat History
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

/// Opens (or creates) the studio database in the given app data directory.
pub fn store_open(dir: &Path) -> Result<Store> {
    Store::open(&dir.join("vibe-studio.db"))
}

/// Detects the OS theme once — the startup value; changes come
/// through the watcher.
pub fn get_system_theme() -> ThemeChoice {
    theme::system_theme()
}

/// Calls the callback with the OS theme on every change. Spawns a
/// background watcher thread that lives for the app's lifetime.
pub fn listen_system_theme(on_change: impl Fn(ThemeChoice) + Send + 'static) -> Result<()> {
    theme::listen_system_theme(on_change)
}
