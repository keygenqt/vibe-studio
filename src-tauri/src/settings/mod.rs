// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The settings block: the user preferences.

//! The settings block: the user preferences — a single row, the
//! fresh state is the fresh read itself.
//!
//! # Submodules
//!
//! - `commands` — the `#[tauri::command]` functions of the block.
//! - `events` — the block event bindings: state and theme payloads.

pub(crate) mod commands;
pub(crate) mod events;
