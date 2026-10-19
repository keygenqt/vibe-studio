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
//! - `view` — `view()`: builds the `StateView`; `emit_state()`: the
//!   single event channel to the UI.
//! - `workspace` — `workspace_get`, `workspace_set_chat_input_size`,
//!   `workspace_set_side_bar` commands.

pub(crate) mod settings;
pub(crate) mod storage;
pub(crate) mod view;
pub(crate) mod workspace;
