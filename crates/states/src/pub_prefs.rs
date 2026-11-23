// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The single-row preferences: the shell environment and the user settings.

//! The single-row tables published as the flat API: the workspace
//! environment and the user preferences.

use anyhow::Result;

use crate::data::settings::SettingsData;
use crate::data::workspace::WorkspaceData;
use crate::db::store::Store;

/// Loads the shell environment; a missing row falls back to `Default`.
pub fn get_workspace(store: &Store) -> Result<WorkspaceData> {
    store.get_workspace()
}

/// Persists the shell environment as the single row, returns it.
pub fn save_workspace(store: &Store, workspace: &WorkspaceData) -> Result<WorkspaceData> {
    store.save_workspace(workspace)
}

/// Loads the user preferences; a missing row falls back to `Default`.
pub fn get_settings(store: &Store) -> Result<SettingsData> {
    store.get_settings()
}

/// Persists the user preferences as the single row, returns it.
pub fn save_settings(store: &Store, settings: &SettingsData) -> Result<SettingsData> {
    store.save_settings(settings)
}
