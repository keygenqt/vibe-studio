// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Application states relay: commands, store bootstrap and the
//! event channel to the UI.
//!
//! # Submodules
//!
//! - `storage` — `store()`: opens the state store in the app data
//!   directory for `app.manage()`.
//! - `settings` — `state_snapshot`, `settings_set_theme` commands.
//! - `sidebar` — `sidebar_get`, `sidebar_set` commands.
//! - `view` — `view()`: builds the `StateView`; `emit_state()`: the
//!   single event channel to the UI.

pub(crate) mod settings;
pub(crate) mod sidebar;
pub(crate) mod storage;
pub(crate) mod view;
