// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Data types of the UI layer served to the shell.

//! Data types of the UI layer served to the shell.
//!
//! # Submodules
//!
//! - `app_info` — `AppInfoData`: the app version and debug flag.
//! - `event_data` — `EventKey` and `EventData`: the uniform event
//!   payload of the event channels.
//! - `groups_chat_state` — `GroupsChatData`: the fresh state of the
//!   groups chat block, returned by its mutations.
//! - `chat_state` — `ChatStateData`: the fresh state of the chat
//!   block, returned by its mutations.
//! - `providers_state` — `ProvidersData`: the fresh state of the
//!   providers block, returned by its mutations.

pub(crate) mod app_info;
pub(crate) mod chat_state;
pub(crate) mod event_data;
pub(crate) mod groups_chat_state;
pub(crate) mod providers_state;
