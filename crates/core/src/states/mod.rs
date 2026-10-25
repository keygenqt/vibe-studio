// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Facade over `studio-states`: domain types and flat API functions
//! for UI shells (Tauri now, FFI later).
//!
//! # Submodules
//!
//! - `api` — the public surface: everything a UI shell may touch.
//! - `models` — `models_load` / `model_load` / `model_save` /
//!   `models_sync` over the store: the provider model catalog with
//!   sync-owned facts and user-owned config.
//! - `provider` — `providers_load` / `provider_save` /
//!   `provider_delete` over the store, validated against the
//!   `studio-cluster` catalog.
//! - `store` — `store_open`: opens (or creates) the database inside
//!   the given app data directory.
//! - `workspace` — `workspace_load` / `workspace_save` over the
//!   store: the shell environment, window and panel sizes, theme,
//!   locale.

pub(crate) mod models;
pub(crate) mod provider;
pub(crate) mod store;
pub(crate) mod workspace;

pub mod api;
