// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: State structures: one file per table with the types and Store access.

//! Application state structures and their persistence.
//!
//! Each file owns its table: the diesel `table!`, the public type
//! with the private diesel pair next to it, and the `impl Store`
//! access. A missing row falls back to `Default`, so a fresh store
//! never blocks startup.
//!
//! # Submodules
//!
//! - `provider` — the `providers` table: `ProviderData` and the
//!   get/save/delete API on `Store`.
//! - `provider_model` — the `models` table: `ProviderModelData`, the
//!   provider catalog with sync-owned facts and user-owned config.
//! - `chat` — the `chats` table: `ChatData`, the auto-name pool,
//!   the get/save/delete API on `Store`.
//! - `group_chat` — the `groups_chat` table: `GroupChatData`, the
//!   get/save/delete API on `Store`.
//! - `group_chat_history` — the `group_chat_history` table:
//!   `GroupChatHistoryData`, the per-group life record — view state,
//!   the app-wide selection, the accumulated counters.
//! - `chat_history` — the `chat_history` table: `ChatHistoryData`,
//!   the chat messages, the `ChatRole` roles and the append-only API
//!   on `Store`.
//! - `workspace` — the `workspace` table: `WorkspaceData`, the shell
//!   environment as a single row (id = 1).
//!
//! Everything here is `pub(crate)`; the public surface is the flat
//! API in `lib.rs`.

pub(crate) mod chat;
pub(crate) mod chat_history;
pub(crate) mod group_chat;
pub(crate) mod group_chat_history;
pub(crate) mod provider;
pub(crate) mod provider_model;
pub(crate) mod workspace;
