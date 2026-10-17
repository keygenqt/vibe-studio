// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

//! State features: persisted application state over the store.
//!
//! Exposed surface: `store_open`, `Store`, `settings_load`,
//! `settings_save`, `sidebar`, `sidebar_load`, `sidebar_save`,
//! `AppState`, `StateView`, `Settings`, `Sidebar`.

use anyhow::Result;
use std::path::Path;

pub use super::app::{AppState, StateView};
pub use vibe_states::{Settings, Sidebar, Store};

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

/// Sidebar constructor. Width is clamped to the allowed range.
pub fn sidebar(collapsed: bool, width: u32) -> Sidebar {
    super::sidebar::sidebar(collapsed, width)
}

/// Loads sidebar state; missing or malformed data falls back to
/// `Default`.
pub fn sidebar_load(store: &Store) -> Sidebar {
    super::sidebar::sidebar_load(store)
}

/// Persists sidebar state.
pub fn sidebar_save(store: &Store, sidebar: &Sidebar) -> Result<()> {
    super::sidebar::sidebar_save(store, sidebar)
}
