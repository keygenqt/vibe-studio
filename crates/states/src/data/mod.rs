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
//! - `providers` — the `providers` table: `ProviderData` and the
//!   get/save/delete API on `Store`.
//! - `models` — the `models` table: `ProviderModelData`, the
//!   provider catalog with sync-owned facts and user-owned config.
//! - `chats` — the `chats` table: `ChatData`, the auto-name pool,
//!   the get/save/delete API on `Store`.
//! - `groups_chat` — the `groups_chat` table: `GroupChatData`, the
//!   get/save/delete API on `Store`.
//! - `group_chat_history` — the `group_chat_history` table:
//!   `GroupChatHistoryData`, the per-group life record — view state,
//!   the app-wide selection, the accumulated counters.
//! - `chat_history` — the `chat_history` table: `ChatHistoryData`,
//!   the chat messages with sender and status, the growing rows and
//!   the API on `Store`.
//! - `chat_attachments` — the `chat_attachments` table:
//!   `ChatAttachmentData`, the file attachments of user messages
//!   with the stored bytes.
//! - `settings` — `SettingsData`: the user preferences as a single row.
//! - `workspace` — the `workspace` table: `WorkspaceData`, the shell
//!   environment as a single row (id = 1).
//!
//! Everything here is `pub(crate)`; the public surface is the flat
//! API in `lib.rs`.

pub(crate) mod chat_attachments;
pub(crate) mod chat_history;
pub(crate) mod chats;
pub(crate) mod group_chat_history;
pub(crate) mod groups_chat;
pub(crate) mod models;
pub(crate) mod providers;
pub(crate) mod settings;
pub(crate) mod workspace;
