// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Facade over `vibe-states`: domain types and flat API functions
//! for UI shells (Tauri now, FFI later).
//!
//! # Submodules
//!
//! - `api` — the public surface: everything a UI shell may touch.
//! - `app` — `AppState`: runtime state mirror, and `StateView`, the
//!   snapshot emitted to the UI.
//! - `settings` — `settings_load` / `settings_save` over the store.
//! - `store` — `store_open`: opens (or creates) the database inside
//!   the given app data directory.
//! - `workspace` — `workspace_load` / `workspace_save` over the
//!   store: window size and panel sizes.

pub(crate) mod app;
pub(crate) mod settings;
pub(crate) mod store;
pub(crate) mod workspace;

pub mod api;
