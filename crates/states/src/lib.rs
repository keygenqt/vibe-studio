// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Application state persistence on SQLite.
//!
//! Owns the database (schema, migrations, KV store) and the state
//! structures saved in it. UI shells talk to this crate through
//! `vibe-core` only.

pub mod constants;

pub(crate) mod state;
pub(crate) mod store;

pub use state::settings::{Settings, ThemeChoice};
pub use state::sidebar::{SIDEBAR_WIDTH_DEFAULT, SIDEBAR_WIDTH_MAX, SIDEBAR_WIDTH_MIN, Sidebar};
pub use state::storable::Storable;
pub use store::store::Store;
