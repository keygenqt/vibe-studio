// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Application state persistence on SQLite.
//!
//! Owns the database (schema, migrations) and the state structures
//! saved in it. UI shells talk to this crate through `studio-core`
//! only.

pub mod constants;

pub(crate) mod state;
pub(crate) mod store;

pub use state::provider::{Provider, ProviderNew};
pub use state::workspace::Workspace;
pub use store::store::Store;
