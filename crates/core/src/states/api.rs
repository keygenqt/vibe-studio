// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! State features: persisted application state over the store.

use anyhow::Result;
use std::path::Path;

pub use super::app::{AppState, StateView};
pub use vibe_states::{Settings, Store, Workspace};

/// Opens (or creates) the database in the given app data directory.
/// The file name lives in `vibe-states` — the shell never knows it.
pub fn store_open(dir: &Path) -> Result<Store> {
    super::store::store_open(dir)
}

/// Loads settings; missing or malformed data falls back to `Default`.
pub fn settings_load(store: &Store) -> Settings {
    super::settings::settings_load(store)
}

/// Persists settings.
pub fn settings_save(store: &Store, settings: &Settings) -> Result<()> {
    super::settings::settings_save(store, settings)
}

/// Loads workspace state; missing or malformed data falls back to
/// `Default` — untouched values stay `None`.
pub fn workspace_load(store: &Store) -> Workspace {
    super::workspace::workspace_load(store)
}

/// Persists workspace state.
pub fn workspace_save(store: &Store, workspace: &Workspace) -> Result<()> {
    super::workspace::workspace_save(store, workspace)
}
