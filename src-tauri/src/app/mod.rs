// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The app block: shell actions and facts without a block state.

//! The app block: the shell actions and facts — no block state, no
//! event channel of its own.
//!
//! # Submodules
//!
//! - `commands` — the `#[tauri::command]` functions of the block.
//! - `include` — `handler()`: the block's command list, the chain
//!   entry of the invoke handler.
//! - `data` — data types of the block served to the shell.

pub(crate) mod commands;
pub(crate) mod data;
pub(crate) mod include;
