// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Core data types: the live events of the chat send.

//! Core data types.
//!
//! # Submodules
//!
//! - `chat_stream` — `ChatStreamEvent`: the live events of a chat send.

mod chat_stream;

pub use chat_stream::ChatStreamEvent;
