// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The workspace block: the shell environment.

//! The workspace block: the shell environment — a single row, the
//! fresh state is the fresh read itself.
//!
//! # Submodules
//!
//! - `commands` — the `#[tauri::command]` functions of the block.
//! - `events` — the block event binding.

pub(crate) mod commands;
pub(crate) mod events;
