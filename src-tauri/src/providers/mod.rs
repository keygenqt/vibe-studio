// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The providers block: providers, their models and defaults.

//! The providers block: providers, their models and defaults.
//!
//! # Submodules
//!
//! - `commands` — the `#[tauri::command]` functions of the block.
//! - `events` — the block event binding.
//! - `data` — data types of the block served to the shell.

pub(crate) mod commands;
pub(crate) mod data;
pub(crate) mod events;
