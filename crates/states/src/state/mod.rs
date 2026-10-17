// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Application state structures and their persistence.
//!
//! Each state is a `Storable` struct serialized as JSON under its own
//! key in the `states` table. Missing or malformed data falls back to
//! `Default`, so a fresh or corrupted store never blocks startup.
//!
//! # Submodules
//!
//! - `schema` — diesel `table!` for the `states` KV table; the only
//!   place that knows the storage schema.
//! - `settings` — `ThemeChoice` (persisted choice), `Settings` with
//!   `Default` and its `Storable` impl (key `"settings"`).
//! - `sidebar` — `Sidebar` state, width bounds (`SIDEBAR_WIDTH_*`) and
//!   its `Storable` impl (key `"sidebar"`).
//! - `storable` — `Storable` trait: typed `load` (falls back to
//!   `Default`) and `save` over the KV layer.
//!
//! Everything here is `pub(crate)`; the public surface is re-exported
//! in `lib.rs`.

pub(crate) mod schema;
pub(crate) mod settings;
pub(crate) mod sidebar;
pub(crate) mod storable;
