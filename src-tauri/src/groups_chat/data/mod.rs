// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Data types of the groups chat block served to the shell.

//! Data types of the groups chat block served to the shell.
//!
//! # Submodules
//!
//! - `chat_data` — `ChatData`: the chat row wire type.
//! - `group_chat_data` — `GroupChatData`: the chat group wire type.
//! - `group_chat_history_data` — `GroupChatHistoryData`: the group
//!   life record wire type.
//! - `groups_chat_state` — `GroupsChatData`: the fresh state of the
//!   groups chat block, returned by its mutations.

pub(crate) mod chat_data;
pub(crate) mod group_chat_data;
pub(crate) mod group_chat_history_data;
pub(crate) mod groups_chat_state;
