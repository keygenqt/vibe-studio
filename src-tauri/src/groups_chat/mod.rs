// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The groups chat block: groups, chats, view state and selection.

//! The groups chat block: groups, chats, view state and selection.
//!
//! # Submodules
//!
//! - `commands` — the `#[tauri::command]` functions of the block.
//! - `events` — the block event binding.
//! - `include` — `handler()`: the block's command list, the chain
//!   entry of the invoke handler.
//! - `data` — data types of the block served to the shell.

pub(crate) mod commands;
pub(crate) mod data;
pub(crate) mod events;
pub(crate) mod include;
