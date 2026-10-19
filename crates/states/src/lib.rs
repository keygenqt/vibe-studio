// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Application state persistence on SQLite.
//!
//! Owns the database (schema, migrations, KV store) and the state
//! structures saved in it. UI shells talk to this crate through
//! `vibe-core` only.

pub mod constants;

pub(crate) mod state;
pub(crate) mod store;

pub use state::settings::{Settings, ThemeChoice};
pub use state::storable::Storable;
pub use state::workspace::Workspace;
pub use store::store::Store;
