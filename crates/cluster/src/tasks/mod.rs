// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The ready tasks: prompts and calls, published by pub_tasks.

//! The ready tasks: one file per task, each carries its own prompt.
//!
//! # Submodules
//!
//! - `compress` — the chat compression task.
//! - `summary` — the chat answer summary task.
//! - `chat_name` — the chat naming task.
//! - `translate` — the translation task.

pub(crate) mod chat_name;
pub(crate) mod compress;
pub(crate) mod summary;
pub(crate) mod translate;
